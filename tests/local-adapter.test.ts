import { createHash } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import { describe, expect, it } from 'vitest'
import { resolveConfig } from 'vite'
import type { ResearchGraph } from '../src/types/research'
import {
  assertSha256, bootstrapGraph, EXPECTED_RESEARCH, LOCAL_RESEARCH_PREFIX,
  localResearchEnabled, localResearchPlugin, localResearchPort, localResource, trustedLocalRequest,
  validateResearchGraph, withoutLocalPaths,
} from '../tools/local-research'

/** Entirely synthetic records. No research quotations, identities, or files. */
function syntheticGraph(): ResearchGraph {
  const relation = { id: 'rel_SYNTHETIC', source: 'SYNTHETIC-a', target: 'SYNTHETIC-b', relation_type: 'synthetic-association', directed: false, polarity: 'synthetic-unknown', claim_ids: ['SYNTHETIC-claim'], paper_ids: ['SYNTHETIC-paper'], context_group_ids: [], support: 1 }
  const nodes = ['a', 'b'].map(id => ({ id: `SYNTHETIC-${id}`, concept_id: `SYNTHETIC-${id}`, label: `Synthetic ${id}`, role: 'Property', aliases: [], paper_ids: ['SYNTHETIC-paper'], paper_count: 1, review_status: 'synthetic' }))
  const view = { nodes, relations: [relation], display_node_ids: nodes.map(node => node.id), display_relation_ids: [relation.id], top_by_role: {} }
  return {
    release: { release_id: EXPECTED_RESEARCH.release, mapping_version: EXPECTED_RESEARCH.mapping, graph_sha256: EXPECTED_RESEARCH.graphSha256, schema_version: 'SYNTHETIC', snapshot_path: '/home/synthetic/private' },
    concepts: nodes.map(node => ({ concept_id: node.concept_id, preferred_label: node.label, chart_roles: ['Property'], aliases: [], definition: null, definition_sources: [], review_status: 'synthetic' })),
    papers: [{ paper_id: 'SYNTHETIC-paper', title: 'Synthetic fixture', doi: null, source_paths: { private: '/home/synthetic/paper.pdf' }, reviewer_provenance: 'synthetic reviewer private' }],
    claims: [{ claim_id: 'SYNTHETIC-claim', paper_id: 'SYNTHETIC-paper', source: 'SYNTHETIC-a', target: 'SYNTHETIC-b', source_original: 'Synthetic A', target_original: 'Synthetic B', relation_family_id: relation.id, relation_type: relation.relation_type, directed: false, polarity: relation.polarity, review_status: 'synthetic', conditions: 'Synthetic condition with units retained', context: { sample: 'SYNTHETIC' }, evidence: [{ quote: 'SYNTHETIC QUOTE' }], extraction_provenance: { local_path: '/home/synthetic/private' } }],
    views: { evidence_full: structuredClone(view), integrated_canonical: structuredClone(view), manual_baseline: structuredClone(view) },
    mappings: [{ mention_id: 'SYNTHETIC-mention', evidence: [{ quote: 'SYNTHETIC MAPPING QUOTE' }] }], audit: {}, normalization_audit: {}, ontology_relations: [],
  }
}
function request(headers: IncomingMessage['headers'] = {}, address = '127.0.0.1') {
  return { headers: { host: '127.0.0.1:5173', ...headers }, socket: { remoteAddress: address } } as Pick<IncomingMessage, 'headers' | 'socket'>
}

describe('explicit development-only research mode', () => {
  it.each([
    ['serve', 'development', false], ['serve', 'production', false],
    ['serve', 'local-research', true], ['build', 'production', false],
    ['build', 'local-research', false],
  ] as const)('enables %s / %s only when explicitly allowed', (command, mode, enabled) => {
    expect(localResearchEnabled({ command, mode })).toBe(enabled)
  })
  it('excludes the adapter from every production build including local-research mode', async () => {
    const config = await resolveConfig({ configFile: false, mode: 'local-research', plugins: [localResearchPlugin()] }, 'build')
    expect(config.plugins.some(plugin => plugin.name === 'matdreams-local-research')).toBe(false)
  })
  it('forces loopback and blocks filesystem access outside the frontend', async () => {
    const config = await resolveConfig({ configFile: false, mode: 'local-research', plugins: [localResearchPlugin()], server: { host: '0.0.0.0' } }, 'serve')
    expect(config.server.host).toBe('127.0.0.1')
    expect(config.server.strictPort).toBe(true)
    expect(config.server.cors).toBe(false)
    expect(config.server.fs.strict).toBe(true)
    expect(config.server.fs.allow).toContain(process.cwd())
    expect(config.server.fs.allow.some(path => path.includes('/Research/'))).toBe(false)
  })
  it('uses an available explicit default while allowing validated CLI/environment ports', () => {
    expect(localResearchPort(undefined, undefined)).toBe(5177)
    expect(localResearchPort(5180, '5178')).toBe(5180)
    expect(localResearchPort(undefined, '5178')).toBe(5178)
    expect(() => localResearchPort(undefined, '0')).toThrow(/port/)
    expect(() => localResearchPort(undefined, 'not-a-port')).toThrow(/port/)
    expect(() => localResearchPort(65536)).toThrow(/port/)
  })
})

describe('loopback request boundary', () => {
  it('allows same-origin loopback and direct local navigation', () => {
    expect(trustedLocalRequest(request(), 5173)).toBe(true)
    expect(trustedLocalRequest(request({ origin: 'http://127.0.0.1:5173', 'sec-fetch-site': 'same-origin' }), 5173)).toBe(true)
    expect(trustedLocalRequest(request({ host: 'localhost:5173', origin: 'http://localhost:5173' }), 5173)).toBe(true)
  })
  it.each([
    { host: 'attacker.example:5173' }, { host: '127.0.0.1:8080' },
    { origin: 'https://attacker.example' }, { origin: 'null' },
    { origin: 'http://127.0.0.1:1234' }, { 'sec-fetch-site': 'cross-site' },
    { origin: 'http://localhost:5173' },
  ])('rejects untrusted host/origin %o', headers => {
    expect(trustedLocalRequest(request(headers), 5173)).toBe(false)
  })
  it('rejects a network client regardless of asserted loopback Host', () => {
    expect(trustedLocalRequest(request({}, '192.0.2.10'), 5173)).toBe(false)
  })
})

describe('fixed resource allowlist', () => {
  it.each(['graph', 'teaching', 'analysis', 'family/rel_SYNTHETIC', 'legacy/core.js', 'legacy/learning.js', 'documents/method', 'figures/convergence-main'])('recognizes %s', route => {
    expect(localResource(LOCAL_RESEARCH_PREFIX + route)).toEqual({ route, download: false })
  })
  it('permits explicit Markdown attachment requests', () => {
    expect(localResource(`${LOCAL_RESEARCH_PREFIX}documents/method?download=1`)?.download).toBe(true)
  })
  it.each(['../graph', '%2e%2e/graph', 'documents/../../AGENTS.md', 'documents/%2e%2e/graph', 'documents/%2Fetc%2Fpasswd', 'documents/%5Cprivate', 'documents/constructor', 'figures/constructor', 'documents/unapproved', 'graph?path=/etc/passwd', 'graph?download=unsafe', 'legacy/scenario.js', 'graph%00', '%ZZ'])('rejects path expansion %s', path => {
    expect(localResource(LOCAL_RESEARCH_PREFIX + path)).toBe(null)
  })
})

describe('frozen source validation and minimal bootstrap', () => {
  it('fails closed on checksum changes', () => {
    const expected = createHash('sha256').update('SYNTHETIC').digest('hex')
    expect(() => assertSha256('SYNTHETIC', expected)).not.toThrow()
    expect(() => assertSha256('ALTERED SYNTHETIC', expected)).toThrow(/checksum mismatch/)
  })
  it('accepts references and rejects unknown endpoints without private fixtures', () => {
    const graph = syntheticGraph()
    expect(() => validateResearchGraph(graph, false)).not.toThrow()
    graph.views.integrated_canonical!.relations[0]!.target = 'SYNTHETIC-missing'
    expect(() => validateResearchGraph(graph, false)).toThrow(/Dangling/)
  })
  it('rejects experimental release identity and incomplete full counts', () => {
    const graph = syntheticGraph()
    expect(() => validateResearchGraph(graph)).toThrow(/counts/)
    graph.release.mapping_version = 'synthetic-experimental'
    expect(() => validateResearchGraph(graph, false)).toThrow(/Unexpected research release/)
  })
  it('retains all conceptual graph records and original scientific semantics', () => {
    const graph = syntheticGraph(), bootstrap = bootstrapGraph(graph)
    expect(bootstrap.views.evidence_full).toEqual(graph.views.evidence_full)
    expect(bootstrap.views.integrated_canonical).toEqual(graph.views.integrated_canonical)
    expect(bootstrap.views.manual_baseline).toBeUndefined()
    expect(bootstrap.claims[0]?.conditions).toBe(graph.claims[0]?.conditions)
    expect(bootstrap.claims[0]?.context).toEqual(graph.claims[0]?.context)
    expect(bootstrap.claims[0]?.directed).toBe(false)
    expect(bootstrap.claims[0]?.polarity).toBe('synthetic-unknown')
    expect(bootstrap.concepts).toHaveLength(2)
  })
  it('defers quotations and omits private location/provenance from bootstrap', () => {
    const bootstrap = bootstrapGraph(syntheticGraph()), serialized = JSON.stringify(bootstrap)
    expect(bootstrap.claims[0]?.evidence).toBeUndefined()
    expect(serialized).not.toContain('SYNTHETIC QUOTE')
    expect(serialized).not.toContain('SYNTHETIC MAPPING QUOTE')
    expect(serialized).not.toContain('/home/')
    expect(serialized).not.toContain('reviewer_provenance')
    expect(serialized).not.toContain('extraction_provenance')
  })
  it('removes nested filesystem paths without dropping scientific locators', () => {
    expect(withoutLocalPaths({ page: [2], source: { path: '/home/synthetic/book.pdf', sha256: 'synthetic', section: 'Synthetic chapter' }, context: { units: 'MPa' } })).toEqual({ page: [2], source: { sha256: 'synthetic', section: 'Synthetic chapter' }, context: { units: 'MPa' } })
  })
})
