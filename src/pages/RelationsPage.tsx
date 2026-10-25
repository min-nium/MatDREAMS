import { useMemo, useState } from 'react'
import { useResearch } from '../app/ResearchContext'
import { ResearchPage } from '../components/ui/ResearchPage'
import { ResearchGraphCanvas } from '../components/graph/ResearchGraphCanvas'
import { ResearchEvidence } from '../components/graph/ResearchEvidence'
import type { ResearchFilters, ResearchNode, ResearchRelation } from '../types/research'

const emptyFilters: ResearchFilters = { category: 'all', relation: 'all', polarity: 'all', cohort: 'all', context: '' }
function rememberedConcept() { try { return sessionStorage.getItem('matdreams:selected-concept') } catch { return null } }

export function RelationsPage() {
  const { graph, index, core } = useResearch()
  const [viewName, setViewName] = useState('integrated_canonical')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [focus, setFocus] = useState<string | null>(rememberedConcept)
  const [selectedNode, setSelectedNode] = useState<string | null>(rememberedConcept)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [limit, setLimit] = useState(14)
  const [indexLimit, setIndexLimit] = useState(50)
  const [showIndex, setShowIndex] = useState(false)
  const [indexKind, setIndexKind] = useState<'concepts' | 'families'>('concepts')
  const view = index?.views[viewName]
  const filtered = useMemo(() => view && core && index ? core.filterView(view, filters, index.claims) : null, [view, core, index, filters])
  const matches = useMemo(() => {
    if (!view || !core || !filtered) return []
    const all = query.trim() ? core.searchNodes(view, query, view.nodes.size) : view.raw.nodes
    return all.filter((node) => filtered.nodes.has(node.id))
  }, [view, core, filtered, query])
  const relationMatches = useMemo(() => {
    if (!filtered || !view) return []
    const tokens = query.toLocaleLowerCase('en').trim().split(/\s+/).filter(Boolean)
    return filtered.raw.relations.filter((item) => {
      const text = [item.id, item.relation_type, item.polarity, view.nodes.get(item.source)?.label, view.nodes.get(item.target)?.label, ...item.paper_ids].join(' ').toLocaleLowerCase('en')
      return tokens.every((token) => text.includes(token))
    })
  }, [filtered, view, query])
  const display = useMemo(() => {
    if (!filtered || !core) return null
    const result = focus ? core.neighborhood(filtered, focus, limit) : core.display(filtered, 10)
    const relation = selectedEdge ? filtered.relations.get(selectedEdge) : null
    // A family chosen outside the bounded drawing must still become visible.
    if (relation && !result.edges.some((item) => item.id === relation.id)) {
      return { nodes: [...new Set([relation.source, relation.target])].flatMap((id) => { const item = filtered.nodes.get(id); return item ? [item] : [] }), edges: [relation], truncated: 0 }
    }
    return result
  }, [filtered, core, focus, limit, selectedEdge])
  const isolated = useMemo(() => view ? [...view.adjacency.values()].filter((edges) => edges.length === 0).length : 0, [view])
  const node = selectedNode ? view?.nodes.get(selectedNode) : null
  const concept = node ? index?.concepts.get(node.concept_id) : null
  const edge = selectedEdge ? view?.relations.get(selectedEdge) : null
  const adjacent = node ? view?.adjacency.get(node.id) || [] : []
  function chooseNode(item: ResearchNode) { setSelectedNode(item.id); setSelectedEdge(null); setFocus(item.id); setLimit(14) }
  function chooseEdge(item: ResearchRelation) { setSelectedEdge(item.id); setSelectedNode(null) }
  function overview() { setFocus(null); setSelectedNode(null); setSelectedEdge(null); setLimit(14) }

  return <ResearchPage title="Relations">{graph && index && core && view && filtered && display && <>
    <p>RHEA System Chart · <code>{graph.release.release_id}</code> · {graph.release.mapping_version}</p>
    <p className="research-counts">Complete indexed universe: {graph.concepts.length.toLocaleString()} canonical concepts · {graph.views.evidence_full?.nodes.length.toLocaleString()} role nodes · {view.relations.size.toLocaleString()} families · {graph.claims.length.toLocaleString()} claims · {graph.papers.length.toLocaleString()} provisional paper IDs.</p>
    <p className="research-warning">Provisional descriptive graph. Paper-ID support is not replication. Adjacency does not establish causal validity or a physically compatible engineering route.</p>
    <div className="research-controls">
      <label>Projection<select value={viewName} onChange={(event) => { setViewName(event.target.value); overview(); setFilters(emptyFilters) }}><option value="integrated_canonical">Canonical concepts — all 6,073 identities</option><option value="evidence_full">Source role nodes — all 6,130 nodes</option></select></label>
      <label>Search all concepts, aliases and IDs<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShowIndex(true); setIndexLimit(50); if (event.target.value.startsWith('rel_')) setIndexKind('families') }} placeholder="Term, concept ID, or relation-family ID" /></label>
      <button className="control" onClick={() => setShowIndex((old) => !old)}>{showIndex ? 'Hide full-coverage index' : 'Open full-coverage index'}</button><button className="control" onClick={overview}>Return to overview</button>
    </div>
    <div className="research-controls">
      {(['category', 'relation', 'polarity', 'cohort'] as const).map((key) => {
        const values = key === 'category' ? view.raw.nodes.flatMap((item) => item.roles || [item.role]) : view.raw.relations.flatMap((item) => key === 'relation' ? [item.relation_type] : key === 'polarity' ? [item.polarity] : item.cohort_status ? [item.cohort_status] : [])
        return <label key={key}>{key === 'category' ? 'Chart role' : key === 'relation' ? 'Relation type' : key === 'polarity' ? 'Polarity' : 'Corpus contribution'}<select value={filters[key]} disabled={key === 'cohort' && values.length === 0} onChange={(event) => { setFilters((old) => ({ ...old, [key]: event.target.value })); setIndexLimit(50) }}><option value="all">{key === 'cohort' && values.length === 0 ? 'Unavailable in this projection' : 'All'}</option>{[...new Set(values)].sort().map((value) => <option key={value}>{value}</option>)}</select></label>
      })}
      <label>Reported context text<input value={filters.context} onChange={(event) => setFilters((old) => ({ ...old, context: event.target.value }))} placeholder="Text match; not compatibility" /></label>
      <button className="control" onClick={() => { setFilters(emptyFilters); setQuery('') }}>Clear filters</button>
    </div>
    <p className="research-counts" role="status">Drawing: {display.nodes.length} nodes / {view.nodes.size.toLocaleString()} total; {display.edges.length} families / {view.relations.size.toLocaleString()} total. Filter-eligible: {filtered.nodes.size.toLocaleString()} nodes / {filtered.relations.size.toLocaleString()} families. {selectedEdge ? 'Selected relation with bounded context' : focus ? 'Selected neighborhood' : 'Ranked overview, 10 nodes per role'} — bounded rendering, full-coverage index. {isolated.toLocaleString()} isolated identities remain searchable.</p>
    {showIndex && <section aria-label="Full graph index"><h2>Full-coverage index</h2>
      <div className="research-controls"><button className="control" aria-pressed={indexKind === 'concepts'} onClick={() => { setIndexKind('concepts'); setIndexLimit(50) }}>Concept index</button><button className="control" aria-pressed={indexKind === 'families'} onClick={() => { setIndexKind('families'); setIndexLimit(50) }}>Relation-family index</button></div>
      <p>{indexKind === 'concepts' ? matches.length.toLocaleString() : relationMatches.length.toLocaleString()} matching {indexKind === 'concepts' ? 'identities' : 'families'}; showing {Math.min(indexLimit, indexKind === 'concepts' ? matches.length : relationMatches.length)}. Isolated concepts remain in the complete concept index.</p>
      <div className="research-list">{indexKind === 'concepts' ? matches.slice(0, indexLimit).map((item) => <button key={item.id} onClick={() => chooseNode(item)} aria-pressed={selectedNode === item.id}>{item.label}<small>{item.role} · {item.paper_count} paper IDs · {item.id}{!view.adjacency.get(item.id)?.length ? ' · isolated' : ''}</small></button>) : relationMatches.slice(0, indexLimit).map((item) => <button key={item.id} onClick={() => chooseEdge(item)} aria-pressed={selectedEdge === item.id}>{view.nodes.get(item.source)?.label} {item.directed ? '→' : '—'} {view.nodes.get(item.target)?.label}<small>{item.relation_type} · {item.polarity} · {item.paper_ids.length} paper IDs · {item.id}</small></button>)}</div>
      {(indexKind === 'concepts' ? matches.length : relationMatches.length) === 0 && <p>No matching record. Try a shorter search or clear filters.</p>}{(indexKind === 'concepts' ? matches.length : relationMatches.length) > indexLimit && <button className="control" onClick={() => setIndexLimit((old) => old + 50)}>Show next 50 indexed records</button>}
    </section>}
    <div className="research-grid"><div>
      <ResearchGraphCanvas key={`${viewName}:${focus}:${selectedEdge}:${limit}:${JSON.stringify(filters)}`} display={display} view={filtered} core={core} selectedNode={selectedNode} selectedEdge={selectedEdge} onNode={chooseNode} onEdge={chooseEdge} />
      {!!display.truncated && <button className="control" onClick={() => setLimit((old) => old + 14)}>Expand neighborhood — next {Math.min(14, display.truncated)} of {display.truncated} families</button>}
      <details><summary>Readable displayed relation families ({display.edges.length})</summary><div className="research-list">{display.edges.map((item) => <button key={item.id} onClick={() => chooseEdge(item)}>{view.nodes.get(item.source)?.label} {item.directed ? '→' : '—'} {view.nodes.get(item.target)?.label}<small>{item.relation_type} · {item.polarity} · {item.id}</small></button>)}</div></details>
    </div><aside className="research-detail" aria-label="Selected scientific record">
      {!node && !edge && <><h2>Inspect a concept or relation</h2><p>Select a node, family, or search result. The overview is a rendering subset of the full frozen graph.</p></>}
      {node && <><h2>{node.label}</h2><p>Original concept: <code>{node.concept_id}</code></p><p>Display node: <code>{node.id}</code></p><p>Roles: {(node.roles || [node.role]).join(' · ')} · Review: {node.review_status}</p>
        <details><summary>Original role nodes and terminology</summary><pre>{JSON.stringify({ role_node_ids: node.source_role_node_ids || [node.id], aliases: concept?.aliases || node.aliases, identity_facets: concept?.identity_facets ?? 'Unavailable' }, null, 2)}</pre></details>
        <h3>Available definition</h3>{concept?.definition ? <p>{typeof concept.definition === 'string' ? concept.definition : JSON.stringify(concept.definition)}</p> : <p>No assigned definition available. General reading aids in Definition are separate from canonical assignments.</p>}
        <a href="#/definition" onClick={() => { try { sessionStorage.setItem('matdreams:selected-concept', node.concept_id) } catch { /* Optional navigation memory. */ } }}>Study this identity in Definition</a>
        <h3>Connected relation families ({adjacent.length})</h3><p>All incident families, including those not drawn.</p><div className="research-list">{adjacent.map((item) => <button key={item.id} onClick={() => chooseEdge(item)}>{view.nodes.get(item.source === node.id ? item.target : item.source)?.label}<small>{item.relation_type} · {item.directed ? (item.source === node.id ? 'Outgoing' : 'Incoming') : 'Undirected'} · {item.polarity} · {item.id}</small></button>)}</div>{!adjacent.length && <p>This isolated identity has no incident families.</p>}
      </>}
      {edge && <><h2>Relation family</h2><p><code>{edge.id}</code></p><p><button className="control" onClick={() => { const item = view.nodes.get(edge.source); if (item) chooseNode(item) }}>{view.nodes.get(edge.source)?.label}</button> {edge.directed ? '→' : '—'} <button className="control" onClick={() => { const item = view.nodes.get(edge.target); if (item) chooseNode(item) }}>{view.nodes.get(edge.target)?.label}</button></p>
        <p>{edge.relation_type} · {edge.directed ? 'Directed as reported' : 'Undirected'} · Polarity: {edge.polarity}</p><p>{edge.support} provisional paper-ID support · {edge.claim_ids.length} claims · {edge.context_group_ids.length} context groups</p>
        <details><summary>Original endpoints and supporting identifiers</summary><pre>{JSON.stringify({ source: edge.source, target: edge.target, paper_ids: edge.paper_ids, claim_ids: edge.claim_ids, context_group_ids: edge.context_group_ids }, null, 2)}</pre></details><ResearchEvidence key={edge.id} familyId={edge.id} />
      </>}
    </aside></div>
  </>}</ResearchPage>
}
