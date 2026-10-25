import { useMemo, useState } from 'react'
import { useResearch } from '../app/ResearchContext'
import { ResearchPage } from '../components/ui/ResearchPage'
import type { ResearchConcept, ResearchGraph, ResearchIndex, LegacyLearning, TeachingSupport } from '../types/research'
import '../styles/exploration.css'

function text(value: unknown, fallback = 'Not supplied'): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function rememberedConcept(): string {
  try { return sessionStorage.getItem('matdreams:selected-concept') ?? '' } catch { return '' }
}

function SourceRecord({ value }: { value: unknown }) {
  const source = object(value)
  return <dl>
    <dt>Source</dt><dd>{text(source.title)}</dd>
    <dt>Edition / section</dt><dd>{text(source.edition)} / {text(source.section)}</dd>
    <dt>Printed page / PDF page</dt><dd>{text(source.printed_page)} / {text(source.pdf_page)}</dd>
    <dt>Source identity</dt><dd className="term-detail__id">{text(source.sha256)}</dd>
    {source.mapping_status != null && <><dt>Mapping review</dt><dd>{text(source.mapping_status)}</dd></>}
  </dl>
}

function ConceptEntry({ concept, graph, index, learning, teaching, select }: {
  concept: ResearchConcept
  graph: ResearchGraph
  index: ResearchIndex
  learning: LegacyLearning
  teaching: TeachingSupport | null
  select: (id: string) => void
}) {
  const aids = learning.definitionAids(concept, teaching)
  const instances = learning.nodesForConcept(graph, concept.concept_id)
  const roleNodeIds = instances.flatMap((node) => node.source_role_node_ids ?? [node.id])
  const originalTerms = graph.mappings.filter((mapping) => mapping.concept_id === concept.concept_id)
  const related = [...new Set([...(concept.broader_ids ?? []), ...(concept.related_ids ?? [])])]
  const jumpToRelations = () => {
    try { sessionStorage.setItem('matdreams:selected-concept', concept.concept_id) } catch { /* Navigation remains available without storage. */ }
  }

  return <article className="term-detail" aria-labelledby="term-detail-title">
    <span className="label-sm">Canonical scientific concept</span>
    <h2 id="term-detail-title">{concept.preferred_label}</h2>
    <p className="term-detail__id">{concept.concept_id}</p>
    <dl>
      <dt>Chart roles</dt><dd>{concept.chart_roles.join(' · ') || 'Not supplied'}</dd>
      <dt>Concept review</dt><dd>{concept.review_status}</dd>
      <dt>Definition status</dt><dd>{concept.definition_status ?? 'Not supplied'} · {concept.definition_review_status ?? 'Review not supplied'}</dd>
      <dt>Aliases preserved upstream</dt><dd>{concept.aliases.join('; ') || 'No aliases supplied'}</dd>
    </dl>
    <h3>Assigned definition</h3>
    {concept.definition
      ? <><p className="term-detail__prose">{concept.definition}</p>{concept.definition_sources.map((source, i) => <SourceRecord key={i} value={source} />)}</>
      : <p className="research-warning">No assigned definition is available for this concept. A missing definition is not filled by the frontend.</p>}

    <h3>General textbook reading aids</h3>
    <p>Exact label or alias matches from the existing source-inspected teaching pool. A general reading aid is not an assigned definition or experimental evidence for this canonical identity.</p>
    {aids.length === 0 ? <p>No exact-match textbook reading aid is available.</p> : aids.map((aid) => <section className="term-detail__reading-aid" key={text(aid.definition_id)}>
      <h4>{text(aid.preferred_label)}</h4>
      <p className="term-detail__prose">{text(aid.definition)}</p>
      <p>{text(aid.mapping_status)}</p>
      <p>{text(aid.scope_note, '')}</p>
      <SourceRecord value={aid.source} />
    </section>)}

    <h3>Original terminology and source usage</h3>
    <p>{originalTerms.length.toLocaleString()} original mention record{originalTerms.length === 1 ? '' : 's'}; first {Math.min(8, originalTerms.length)} shown. These are paper-specific usages, separate from textbook definitions.</p>
    {originalTerms.slice(0, 8).map((mapping) => <section className="term-detail__usage" key={mapping.mention_id}>
      <h4>{text(mapping.original_keyword)}</h4>
      <p className="term-detail__id">{mapping.mention_id}</p>
      <p>Provisional paper ID: {text(mapping.paper_id)}</p>
      <p>{text(mapping.reason)}</p>
      <details><summary>Available original measurement context</summary><pre>{JSON.stringify(mapping.context ?? null, null, 2)}</pre></details>
    </section>)}
    {originalTerms.length === 0 && <p>No original mention context is available in the local presentation payload.</p>}

    <h3>Roles and identity qualifiers</h3>
    <p>{roleNodeIds.length} available original role node{roleNodeIds.length === 1 ? '' : 's'}.</p>
    <ul>{roleNodeIds.map((id) => <li className="term-detail__id" key={id}>{id}</li>)}</ul>
    <details><summary>Preserved identity facets</summary><pre>{JSON.stringify(concept.identity_facets ?? {}, null, 2)}</pre></details>

    <h3>Assigned related concepts</h3>
    {related.length ? <ul>{related.map((id) => <li key={id}><button type="button" className="control" onClick={() => select(id)}>{index.concepts.get(id)?.preferred_label ?? id}</button> {(concept.broader_ids ?? []).includes(id) ? '(broader)' : '(related)'}</li>)}</ul> : <p>No broader or related canonical link is assigned. Similar spelling does not establish concept identity.</p>}
    <p><a href="#/relations" onClick={jumpToRelations}>Explore this exact concept in Relations</a></p>
  </article>
}

function TerminologyBrowser({ graph, index, learning, teaching }: {
  graph: ResearchGraph
  index: ResearchIndex
  learning: LegacyLearning
  teaching: TeachingSupport | null
}) {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [selectedId, setSelectedId] = useState(rememberedConcept)
  const [limit, setLimit] = useState(50)
  const roles = useMemo(() => [...new Set(graph.concepts.flatMap((concept) => concept.chart_roles))].sort(), [graph])
  const result = useMemo(() => learning.searchConcepts(graph, query, graph.concepts.length), [graph, learning, query])
  const filtered = useMemo(() => result.items.filter((concept) => role === 'all' || concept.chart_roles.includes(role)), [result, role])
  const selected = index.concepts.get(selectedId) ?? filtered[0]

  return <div className="term-browser">
    <p className="research-counts">{graph.concepts.length.toLocaleString()} canonical concepts · {graph.concepts.filter((concept) => concept.definition).length} populated assigned definitions · {teaching?.definitions.length ?? 0} general reading aids</p>
    <div className="term-browser__controls">
      <label><span className="label-sm">Search terminology, alias or ID</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(50) }} placeholder="e.g. tensile yield strength" /></label>
      <label><span className="label-sm">Browse chart role</span><select value={role} onChange={(event) => { setRole(event.target.value); setLimit(50) }}><option value="all">All available roles</option>{roles.map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    <p role="status">{filtered.length.toLocaleString()} matching concepts; {Math.min(filtered.length, limit)} displayed. Different source meanings retain separate IDs.</p>
    <div className="term-browser__columns">
      <section aria-label="Terminology index">
        <div className="term-browser__index">{filtered.slice(0, limit).map((concept) => <button type="button" key={concept.concept_id} className="term-browser__entry" aria-pressed={concept.concept_id === selected?.concept_id} onClick={() => setSelectedId(concept.concept_id)}>
          {concept.preferred_label}<small>{concept.chart_roles.join(' · ')}</small><small>{concept.concept_id}</small>
        </button>)}</div>
        {filtered.length === 0 && <p>No terminology matches these filters.</p>}
        {filtered.length > limit && <div className="term-pagination"><button type="button" className="control" onClick={() => setLimit((value) => value + 50)}>Show next {Math.min(50, filtered.length - limit)}</button></div>}
      </section>
      {selected ? <ConceptEntry concept={selected} graph={graph} index={index} learning={learning} teaching={teaching} select={setSelectedId} /> : <p>Select a concept to inspect its available terminology records.</p>}
    </div>
  </div>
}

export function DefinitionPage() {
  const { graph, index, learning, teaching } = useResearch()
  return <ResearchPage title="Definition">
    <p className="research-intro">Read the terminology before interpreting a connection. Canonical concepts preserve physical meaning, source qualifiers and unresolved distinctions.</p>
    {graph && index && learning && <TerminologyBrowser graph={graph} index={index} learning={learning} teaching={teaching} />}
  </ResearchPage>
}
