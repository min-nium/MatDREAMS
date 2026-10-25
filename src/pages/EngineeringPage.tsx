import { useMemo, useState } from 'react'
import { useResearch } from '../app/ResearchContext'
import { ResearchPage } from '../components/ui/ResearchPage'
import { fetchResearch } from '../data/researchClient'
import { findDirectedPath, scenarioRelations } from '../data/scenarioGraph'
import type { GraphPath, ScenarioRelation } from '../data/scenarioGraph'
import type { IndexedView, LegacyCore, ResearchClaim, ResearchIndex, ResearchPaper, ResearchRelation } from '../types/research'
import '../styles/exploration.css'

function withToggle(values: ReadonlySet<string>, value: string): Set<string> {
  const next = new Set(values)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function EvidenceReader({ relation }: { relation: ResearchRelation }) {
  const [record, setRecord] = useState<{ claims: ResearchClaim[]; papers: ResearchPaper[] } | null>(null)
  const [status, setStatus] = useState('')
  const load = () => {
    setStatus('Loading original supporting records…')
    void fetchResearch<{ claims: ResearchClaim[]; papers: ResearchPaper[] }>(`family/${encodeURIComponent(relation.id)}`)
      .then((value) => { setRecord(value); setStatus('') })
      .catch((error: unknown) => setStatus(error instanceof Error ? error.message : 'Evidence could not be loaded.'))
  }
  return <div>
    <button type="button" className="control" onClick={load} disabled={status.startsWith('Loading')}>Inspect original evidence</button>
    {status && <p role="status">{status}</p>}
    {record && <div>
      <p>Original support: {relation.paper_ids.length} provisional paper IDs. This is not independent replication.</p>
      {record.papers.map((paper) => {
        const doi = paper.doi && /^10\.\d{4,9}\/\S+$/i.test(paper.doi) ? `https://doi.org/${paper.doi.split('/').map(encodeURIComponent).join('/')}` : null
        return <p key={paper.paper_id}>{paper.title ?? 'Title unavailable'}<br /><span className="scenario-id">{paper.paper_id}</span><br />{doi && <a href={doi} target="_blank" rel="noreferrer">DOI record — {paper.publication_identity?.source_confirmed_primary ? 'source-confirmed identifier' : 'provisional identity'}</a>}</p>
      })}
      {record.claims.map((claim) => <details key={claim.claim_id}><summary>Original claim {claim.claim_id}</summary>
        <p>{claim.source_original} {claim.directed ? '→' : '—'} {claim.target_original}</p>
        <p>{claim.relation_type} · polarity {claim.polarity} · {claim.review_status}</p>
        <p>Reported conditions:</p><pre>{JSON.stringify(claim.conditions ?? null, null, 2)}</pre>
        <p>Available local evidence and locators:</p><pre>{claim.evidence?.length ? JSON.stringify(claim.evidence, null, 2) : 'Quotation/context data unavailable in this payload.'}</pre>
      </details>)}
    </div>}
  </div>
}

function PathView({ path, view, highlighted, modified }: {
  path: GraphPath | null
  view: IndexedView
  highlighted: ReadonlySet<string>
  modified: boolean
}) {
  if (!path) return <p>No path found within eight relations under this view. This is a bounded reachability result, not proof that a physical route is impossible.</p>
  const height = path.nodeIds.length * 80 + 15
  const markerId = modified ? 'scenario-arrow' : 'original-arrow'
  return <>
    <p>{path.relations.length} relation{path.relations.length === 1 ? '' : 's'} in this shortest directed traversal, bounded to eight hops.</p>
    <div className="scenario-canvas" aria-hidden="true"><svg viewBox={`0 0 360 ${height}`}>
      <defs><marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" /></marker></defs>
      {path.relations.map((relation, i) => <path key={relation.id} d={`M180 ${i * 80 + 60} L180 ${i * 80 + 90}`} className={relation.hypothetical ? 'hypothetical' : ''} {...(relation.directed ? { markerEnd: `url(#${markerId})` } : {})} />)}
      {path.nodeIds.map((id, i) => <g key={id}><rect x="10" y={i * 80 + 10} width="340" height="50" className={highlighted.has(id) ? 'highlighted' : ''} /><text x="24" y={i * 80 + 40}>{(view.nodes.get(id)?.label ?? id).slice(0, 43)}</text></g>)}
    </svg></div>
    <ol className="scenario-path">{path.nodeIds.map((id, i) => {
      const relation = path.relations[i]
      return <li key={id} className={relation?.hypothetical ? 'scenario-path__hypothesis' : ''}>
        <strong>{view.nodes.get(id)?.label ?? id}</strong>{highlighted.has(id) && <span> · Highlighted</span>}
        <div className="scenario-id">{id}</div>
        {relation && <>
          <p><strong>{relation.hypothetical ? 'HYPOTHETICAL — no research evidence' : 'Original source family'}</strong><br />{relation.relation_type} · {relation.directed ? 'directed' : 'undirected'} · polarity {relation.polarity}</p>
          <p className="scenario-id">{relation.id}</p>
          {relation.hypothetical ? <p>{String(relation.scenario_note)}</p> : <EvidenceReader key={relation.id} relation={relation} />}
        </>}
      </li>
    })}</ol>
  </>
}

function ScenarioWorkspace({ view, index, core }: { view: IndexedView; index: ResearchIndex; core: LegacyCore }) {
  const first = view.raw.relations[0]
  const [start, setStart] = useState(first?.source ?? '')
  const [target, setTarget] = useState(first?.target ?? '')
  const [query, setQuery] = useState('')
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState<ScenarioRelation[]>([])
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [neighborLimit, setNeighborLimit] = useState(14)
  const modified = useMemo(() => scenarioRelations(view.raw.relations, { removed, hidden, added }), [view, removed, hidden, added])
  const originalPath = useMemo(() => findDirectedPath(view.raw.relations, start, target), [view, start, target])
  const modifiedPath = useMemo(() => findDirectedPath(modified, start, target, hidden), [modified, start, target, hidden])
  const results = useMemo(() => query.trim() ? core.searchNodes(view, query, 30) : view.raw.display_node_ids.slice(0, 8).flatMap((id) => { const node = view.nodes.get(id); return node ? [node] : [] }), [core, view, query])
  const adjacent = core.neighborhood(view, start, neighborLimit)
  const label = (id: string) => view.nodes.get(id)?.label ?? id
  const selectStart = (id: string) => { setStart(id); setNeighborLimit(14) }
  const addRelation = () => {
    if (!start || !target || start === target) { setMessage('Choose two different concepts for the hypothetical relation.'); return }
    const id = `hypothetical-${Date.now()}-${added.length}`
    setAdded((values) => [...values, { id, source: start, target, relation_type: 'user_hypothesis', directed: true, polarity: 'unspecified', claim_ids: [], paper_ids: [], context_group_ids: [], support: 0, hypothetical: true, scenario_note: note.trim() || 'User-proposed connection; no source evidence assigned.' }])
    setMessage('Added a hypothetical directed relation to the temporary scenario only.')
  }
  const reset = () => { setRemoved(new Set()); setHidden(new Set()); setHighlighted(new Set()); setAdded([]); setNote(''); setMessage('Scenario reset. Original graph retained unchanged.') }

  return <div className="scenario-workspace">
    <aside className="scenario-notice"><strong>Temporary hypothetical scenario</strong><p>Edits affect this browser view only. Graph reachability does not establish a physically compatible engineering route, causality, or quantitative property improvement. Conditions and specimen transfers have not been established.</p></aside>
    <h2>Choose starting and target concepts</h2>
    <div className="scenario-controls">
      <label><span className="label-sm">Find starting or target concept</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the entire canonical graph" /></label>
      <button type="button" className="control" onClick={reset}>Reset scenario</button>
    </div>
    <p className="research-counts">Search coverage: {view.nodes.size.toLocaleString()} concepts / {view.relations.size.toLocaleString()} original families. {query.trim() ? 'Up to 30 matching concepts shown.' : 'Initial overview suggestions shown.'}</p>
    <div className="scenario-search-results">{results.map((node) => <div className="scenario-search-result" key={node.id}>
      <div><strong>{node.label}</strong><div className="scenario-id">{node.id} · {(node.roles ?? [node.role]).join(' / ')}</div></div>
      <div className="scenario-search-result__actions"><button type="button" className="control" onClick={() => selectStart(node.id)}>Set start</button><button type="button" className="control" onClick={() => setTarget(node.id)}>Set target</button><button type="button" className="control" aria-pressed={highlighted.has(node.id)} onClick={() => setHighlighted((values) => withToggle(values, node.id))}>{highlighted.has(node.id) ? 'Unhighlight' : 'Highlight'}</button><button type="button" className="control" aria-pressed={hidden.has(node.id)} onClick={() => setHidden((values) => withToggle(values, node.id))}>{hidden.has(node.id) ? 'Show' : 'Hide'}</button></div>
    </div>)}</div>
    {query.trim() && results.length === 0 && <p>No matching concept. Original isolated concepts remain searchable.</p>}
    <div className="scenario-selected">{[{ name: 'Starting concept', id: start }, { name: 'Target concept', id: target }].map(({ name, id }) => <div key={name}><span className="label-sm">{name}</span><h3>{label(id)}</h3><p className="scenario-id">{id}</p><p>{hidden.has(id) ? 'Hidden in modified view' : 'Visible in modified view'} · {highlighted.has(id) ? 'Highlighted' : 'Not highlighted'}</p></div>)}</div>
    <div className="scenario-controls"><label><span className="label-sm">Hypothesis note — start to target</span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional rationale; never scientific evidence" /></label><button type="button" className="control" onClick={addRelation}>Add hypothetical relation</button></div>
    {message && <p role="status">{message}</p>}
    <p className="research-counts">Original: {view.relations.size.toLocaleString()} families. Modified view: {modified.length.toLocaleString()} relations. Changes: {removed.size} removed, {added.length} hypothetical, {hidden.size} concepts hidden, {highlighted.size} highlighted.</p>
    <h2>Compare reachability</h2>
    <div className="scenario-comparison">
      <section aria-label="Original graph path"><span className="label-sm">Original source graph</span><h3>Original reachability</h3><PathView path={originalPath} view={view} highlighted={highlighted} modified={false} /></section>
      <section aria-label="Modified hypothetical graph path"><span className="label-sm">Hypothetical user view</span><h3>Modified reachability</h3><PathView path={modifiedPath} view={view} highlighted={highlighted} modified /></section>
    </div>
    <h2>Starting-concept relation ledger</h2>
    <p>{adjacent.edges.length} of {adjacent.totalAdjacent ?? 0} incident original families shown. Use this list to remove or restore a family in the modified view; its original identity and evidence remain intact.</p>
    <div className="scenario-ledger__wrap"><table className="scenario-ledger"><caption>Original incident families and scenario changes</caption><thead><tr><th scope="col">Reported connection</th><th scope="col">Meaning and support</th><th scope="col">Scenario action</th></tr></thead><tbody>{adjacent.edges.map((relation) => <tr key={relation.id}><td>{label(relation.source)} {relation.directed ? '→' : '—'} {label(relation.target)}<div className="scenario-id">{relation.id}</div></td><td>{relation.relation_type} · {relation.polarity}<br />{relation.paper_ids.length} provisional paper IDs<br />{index.claims.get(relation.claim_ids[0] ?? '')?.review_status ?? 'Review state unavailable'}</td><td><button type="button" className="control" aria-pressed={removed.has(relation.id)} onClick={() => setRemoved((values) => withToggle(values, relation.id))}>{removed.has(relation.id) ? 'Restore relation' : 'Remove relation'}</button><EvidenceReader relation={relation} /></td></tr>)}</tbody></table></div>
    {(adjacent.totalAdjacent ?? 0) > adjacent.edges.length && <p><button type="button" className="control" onClick={() => setNeighborLimit((value) => value + 14)}>Show next incident families</button></p>}
    {adjacent.edges.length === 0 && <p>This starting concept has no original incident family. No empirical connection is invented.</p>}
    {(added.length > 0 || hidden.size > 0 || highlighted.size > 0) && <section><h2>Temporary change ledger</h2><ul className="scenario-change-list">
      {added.map((relation) => <li key={relation.id}><span>HYPOTHETICAL: {label(relation.source)} → {label(relation.target)} · {relation.scenario_note}</span><button type="button" className="control" onClick={() => setAdded((values) => values.filter((value) => value.id !== relation.id))}>Delete hypothetical relation</button></li>)}
      {[...hidden].map((id) => <li key={`hidden-${id}`}><span>Hidden concept: {label(id)}</span><button type="button" className="control" onClick={() => setHidden((values) => withToggle(values, id))}>Show concept</button></li>)}
      {[...highlighted].map((id) => <li key={`highlighted-${id}`}><span>Highlighted concept: {label(id)}</span><button type="button" className="control" onClick={() => setHighlighted((values) => withToggle(values, id))}>Remove highlight</button></li>)}
    </ul></section>}
    <p>All source edges retain their original direction, relation type, polarity and provisional paper-ID support. No strength, ductility, sensitivity or numerical optimization is calculated; no validated quantitative model is available.</p>
    <p><a href="#/relations">Return to the full Relations instrument</a></p>
  </div>
}

export function EngineeringPage() {
  const { index, core } = useResearch()
  const view = index?.views.integrated_canonical
  return <ResearchPage title="Engineering">
    <p className="research-intro">Explore how a graph scenario changes reachability while keeping every research record untouched. Original evidence and user hypotheses remain visibly separate.</p>
    {view && index && core && <ScenarioWorkspace view={view} index={index} core={core} />}
  </ResearchPage>
}
