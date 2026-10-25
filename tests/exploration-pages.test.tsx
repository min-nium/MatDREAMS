import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResearchState } from '../src/app/ResearchContext'
import type { IndexedView, LegacyCore, LegacyLearning, ResearchGraph, ResearchIndex, ResearchNode, ResearchRelation, TeachingSupport } from '../src/types/research'
import { DefinitionPage } from '../src/pages/DefinitionPage'
import { EngineeringPage } from '../src/pages/EngineeringPage'

let testState: ResearchState
vi.mock('../src/app/ResearchContext', () => ({ useResearch: () => testState }))

// Explicitly synthetic local-interface fixture. It contains no research records.
const nodes: ResearchNode[] = ['a', 'b'].map((id) => ({
  id, concept_id: id, label: `Synthetic ${id}`, role: 'Property', roles: ['Property'],
  source_role_node_ids: [`role-${id}`], aliases: [], paper_ids: [], paper_count: 0,
  review_status: 'synthetic-unreviewed',
}))
const relation: ResearchRelation = { id: 'synthetic-family', source: 'a', target: 'b', directed: true, relation_type: 'synthetic', polarity: 'unknown', claim_ids: [], paper_ids: [], context_group_ids: [], support: 0 }
const graph: ResearchGraph = {
  release: { release_id: 'synthetic-test', mapping_version: 'synthetic', graph_sha256: 'synthetic', schema_version: 'synthetic' },
  concepts: nodes.map((node) => ({ concept_id: node.id, preferred_label: node.label, aliases: [], chart_roles: ['Property'], definition: null, definition_sources: [], review_status: 'synthetic-unreviewed' })),
  papers: [], claims: [], mappings: [],
  views: { integrated_canonical: { nodes, relations: [relation], display_node_ids: ['a', 'b'], display_relation_ids: [relation.id], top_by_role: { Property: ['a', 'b'] } } },
  audit: {}, normalization_audit: {}, ontology_relations: [],
}
const view: IndexedView = { name: 'integrated_canonical', raw: graph.views.integrated_canonical!, nodes: new Map(nodes.map((node) => [node.id, node])), relations: new Map([[relation.id, relation]]), adjacency: new Map(nodes.map((node) => [node.id, [relation]])) }
const index: ResearchIndex = { views: { integrated_canonical: view }, concepts: new Map(graph.concepts.map((concept) => [concept.concept_id, concept])), papers: new Map(), claims: new Map() }
const core: LegacyCore = {
  indexGraph: () => index,
  searchNodes: () => nodes,
  filterView: () => view,
  neighborhood: () => ({ nodes, edges: [relation], totalAdjacent: 1, truncated: 0 }),
  display: () => ({ nodes, edges: [relation], truncated: 0 }),
  columnNodes: () => nodes,
  wrapLabel: (label) => [label],
}
const teaching: TeachingSupport = { graph_release: { graph_sha256: 'synthetic' }, definitions: [{ definition_id: 'synthetic-aid', preferred_label: 'Synthetic aid', definition: 'Synthetic general reading aid.', mapping_status: 'pending', source: { title: 'Synthetic textbook', path: '__SYNTHETIC_PRIVATE_SOURCE_PATH__' } }] }
const learning: LegacyLearning = {
  searchConcepts: () => ({ total: graph.concepts.length, items: graph.concepts }),
  definitionAids: () => teaching.definitions,
  nodesForConcept: (_, id) => nodes.filter((node) => node.id === id),
}

beforeEach(() => {
  vi.unstubAllGlobals()
  testState = { system: 'RHEA', enabled: true, status: 'ready', error: null, graph, index, core, learning, teaching, retry: () => undefined }
})

describe('scientific exploration page states', () => {
  it('separates missing assigned definitions and general aids without exposing source paths', () => {
    const html = renderToStaticMarkup(<DefinitionPage />)
    expect(html).toContain('LOCAL RESEARCH DEMO')
    expect(html).toContain('No assigned definition is available')
    expect(html).toContain('Synthetic general reading aid.')
    expect(html).toContain('Synthetic textbook')
    expect(html).not.toContain('__SYNTHETIC_PRIVATE_SOURCE_PATH__')
    expect(html).toContain('Explore this exact concept in Relations')
  })

  it('opens the exact concept handed off from Relations', () => {
    vi.stubGlobal('sessionStorage', { getItem: () => 'b' })
    const html = renderToStaticMarkup(<DefinitionPage />)
    expect(html).toContain('id="term-detail-title">Synthetic b</h2>')
  })

  it('labels temporary scenarios and preserves an explicit original comparison', () => {
    const html = renderToStaticMarkup(<EngineeringPage />)
    expect(html).toContain('Original reachability')
    expect(html).toContain('Modified reachability')
    expect(html).toContain('Graph reachability does not establish a physically compatible engineering route')
    expect(html).toContain('Add hypothetical relation')
    expect(html).toContain('Original source family')
    expect(html).toContain('synthetic-family')
    expect(html).toContain('Inspect original evidence')
  })

  it('withholds RHEA terminology and paths when Ni is selected', () => {
    testState = { ...testState, system: 'Ni Superalloy', status: 'unavailable', graph: null, index: null }
    for (const Page of [DefinitionPage, EngineeringPage]) {
      const html = renderToStaticMarkup(<Page />)
      expect(html).toContain('Ni Superalloy — pending integration')
      expect(html).not.toContain('Synthetic a')
      expect(html).not.toContain('synthetic-family')
    }
  })
})
