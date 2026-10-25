/** Read-only, loopback-only Vite adapter. Never imported by the browser build. */
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile, realpath } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve, sep } from 'node:path'
import { gzipSync } from 'node:zlib'
import type { ConfigEnv, Plugin } from 'vite'
import type { ResearchClaim, ResearchGraph, ResearchPaper } from '../src/types/research.ts'

export const LOCAL_RESEARCH_PREFIX = '/__matdreams_local__/'
export const RESEARCH_ROOT = '/home/min/Research/5_LLMforCCAs'
export const EXPECTED_RESEARCH = Object.freeze({
  release: 'rhea-system-chart-20261024-v4',
  mapping: 'conservative-context-v5',
  graphSha256: '313d36d3adc4541c6d51e3f7086b47f12426513c91e46b461f125fb0815f4778',
  clientSha256: '4366792b226bfd813db99cd42f862680c65126b0734961a24e65a99ae30b6dfb',
  buildManifestSha256: '3b330775395f76595cfd756a86329c2f61ae701689ea9b45e49222f5913da9c8',
  artifactManifestSha256: 'c4b2a6ba6bb62b78d92e3c6c8b8ede04165bd75d53cc6a24db20206c1bd601c9',
  papers: 1561, claims: 3297, concepts: 6073, roleNodes: 6130, families: 3194,
})

export const DOCUMENTS = Object.freeze({
  method: 'UNIVERSAL_SYSTEM_CHART_METHOD',
  reproducibility: 'SYSTEM_CHART_REPRODUCIBILITY',
  'graph-status': 'GRAPH_STATUS',
  convergence: 'CONVERGENCE_DIAGNOSTICS',
  normalization: 'NORMALIZATION_EVALUATION',
  validation: 'VALIDATION_REPORT',
})
const FIGURES = Object.freeze({
  'convergence-main': 'figures/convergence_main.png',
  'convergence-strata': 'figures/convergence_strata.png',
  normalization: 'figures/keyword_normalization_before_after.png',
})
const LEGACY = Object.freeze({
  'core.js': '5c2fcba4c04d4882eaeb9cf1e59914ecab3675faae5a1188a61fd9c5cbcfb619',
  'learning.js': 'e28718b5bb7abe0071a734baa66516a18962cb256939f8990b6e551c7eae0c7e',
})
type RecordValue = Record<string, unknown>
interface Manifest extends RecordValue { files: { relative_path: string; sha256: string }[] }
interface LocalSnapshot {
  graph: ResearchGraph
  graphJson: Buffer
  graphGzip: Buffer
  claims: Map<string, ResearchClaim>
  papers: Map<string, ResearchPaper>
  manifest: Manifest
}

export function localResearchEnabled(env: Pick<ConfigEnv, 'command' | 'mode'>): boolean {
  return env.command === 'serve' && env.mode === 'local-research'
}

export function localResearchPort(configured?: number, environment = process.env.MATDREAMS_DEMO_PORT): number {
  const port = configured ?? (environment ? Number(environment) : 5177)
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Local research port must be an integer between 1024 and 65535.')
  return port
}

export function assertSha256(bytes: string | Buffer, expected: string): void {
  if (createHash('sha256').update(bytes).digest('hex') !== expected) {
    throw new Error('Frozen research source checksum mismatch. Local demo is unavailable.')
  }
}

/** Do not let a filename/query string expand this explicit resource allowlist. */
export function localResource(rawUrl: string): { route: string; download: boolean } | null {
  let decoded: string
  try { decoded = decodeURIComponent(rawUrl.split('?')[0] ?? '') } catch { return null }
  if (decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').some(part => part === '..' || part === '.')) return null
  if (!decoded.startsWith(LOCAL_RESEARCH_PREFIX)) return null
  const route = decoded.slice(LOCAL_RESEARCH_PREFIX.length)
  if (!/^(graph|teaching|analysis|family\/rel_[a-zA-Z0-9_-]+|documents\/[a-z-]+|figures\/[a-z-]+|legacy\/(core|learning)\.js)$/.test(route)) return null
  const [kind, key] = route.split('/')
  if ((kind === 'documents' && (!key || !Object.hasOwn(DOCUMENTS, key))) || (kind === 'figures' && (!key || !Object.hasOwn(FIGURES, key)))) return null
  const search = new URL(rawUrl, 'http://127.0.0.1').searchParams
  if ([...search.keys()].some(key => key !== 'download') || (search.has('download') && search.get('download') !== '1')) return null
  return { route, download: search.get('download') === '1' }
}

/** Host+Origin+socket checks prevent DNS rebinding and cross-origin local-data reads. */
export function trustedLocalRequest(request: Pick<IncomingMessage, 'headers' | 'socket'>, port: number): boolean {
  const allowed = new Set([`127.0.0.1:${port}`, `localhost:${port}`])
  if (!allowed.has(request.headers.host ?? '')) return false
  if (!['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(request.socket.remoteAddress ?? '')) return false
  const origin = request.headers.origin
  if (origin && origin !== `http://${request.headers.host}`) return false
  const site = request.headers['sec-fetch-site']
  return !site || site === 'same-origin' || site === 'none'
}

function record(value: unknown): RecordValue {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid local research object.')
  return value as RecordValue
}
function records(value: unknown): RecordValue[] {
  if (!Array.isArray(value)) throw new Error('Invalid local research collection.')
  return value.map(record)
}
function assertIdentity(value: unknown): void {
  const entry = record(value)
  if (entry.release_id !== EXPECTED_RESEARCH.release || entry.mapping_version !== EXPECTED_RESEARCH.mapping || entry.graph_sha256 !== EXPECTED_RESEARCH.graphSha256) {
    throw new Error('Unexpected research release. Only the frozen production v4 release is permitted.')
  }
}
function uniqueIds(items: RecordValue[], key: string): Set<string> {
  const ids = new Set<string>()
  for (const item of items) {
    const id = item[key]
    if (typeof id !== 'string' || !id || ids.has(id)) throw new Error('Missing or duplicate scientific identifier.')
    ids.add(id)
  }
  return ids
}
function checkReferences(value: unknown, known: Set<string>): void {
  if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !known.has(id))) throw new Error('Malformed scientific reference.')
}

/** Small synthetic inputs can exercise structural validation without private fixtures. */
export function validateResearchGraph(value: unknown, enforceCounts = true): asserts value is ResearchGraph {
  const graph = record(value)
  assertIdentity(graph.release)
  const concepts = records(graph.concepts), claims = records(graph.claims), papers = records(graph.papers)
  const conceptIds = uniqueIds(concepts, 'concept_id'), claimIds = uniqueIds(claims, 'claim_id'), paperIds = uniqueIds(papers, 'paper_id')
  const views = record(graph.views)
  if (enforceCounts && (concepts.length !== EXPECTED_RESEARCH.concepts || claims.length !== EXPECTED_RESEARCH.claims || papers.length !== EXPECTED_RESEARCH.papers)) throw new Error('Frozen research record counts do not match.')
  for (const name of ['evidence_full', 'integrated_canonical']) {
    const view = record(views[name]), nodes = records(view.nodes), edges = records(view.relations)
    const nodeIds = uniqueIds(nodes, 'id'), relationIds = uniqueIds(edges, 'id')
    if (enforceCounts && (nodes.length !== (name === 'evidence_full' ? EXPECTED_RESEARCH.roleNodes : EXPECTED_RESEARCH.concepts) || edges.length !== EXPECTED_RESEARCH.families)) throw new Error('Full graph coverage does not match the frozen release.')
    for (const node of nodes) {
      if (!conceptIds.has(String(node.concept_id))) throw new Error('Unknown canonical concept reference.')
      checkReferences(node.paper_ids, paperIds)
    }
    for (const edge of edges) {
      if (!nodeIds.has(String(edge.source)) || !nodeIds.has(String(edge.target))) throw new Error('Dangling scientific relation.')
      if (typeof edge.directed !== 'boolean' || typeof edge.relation_type !== 'string' || typeof edge.polarity !== 'string') throw new Error('Missing scientific relation semantics.')
      checkReferences(edge.claim_ids, claimIds)
      checkReferences(edge.paper_ids, paperIds)
    }
    checkReferences(view.display_node_ids, nodeIds)
    checkReferences(view.display_relation_ids, relationIds)
  }
  for (const claim of claims) if (!paperIds.has(String(claim.paper_id))) throw new Error('Unknown supporting paper reference.')
}

/** Retain science fields while excluding source locations and extraction internals. */
export function withoutLocalPaths(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutLocalPaths)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !/(^|_)(path|paths)$/.test(key) && !['reviewer_provenance', 'extraction_provenance', 'drive_folder_id'].includes(key)).map(([key, item]) => [key, withoutLocalPaths(item)]))
  if (typeof value === 'string' && /^(\/home\/|\/tmp\/|[A-Za-z]:\\)/.test(value)) return '[local source location withheld]'
  return value
}
function select(item: RecordValue, keys: readonly string[]): RecordValue {
  return Object.fromEntries(keys.filter(key => key in item).map(key => [key, item[key]]))
}

export function bootstrapGraph(graph: ResearchGraph): ResearchGraph {
  return {
    ...graph,
    release: withoutLocalPaths(graph.release) as ResearchGraph['release'],
    concepts: withoutLocalPaths(graph.concepts) as ResearchGraph['concepts'],
    papers: graph.papers.map(paper => withoutLocalPaths(select(paper, ['paper_id', 'title', 'doi', 'doi_url', 'source_url', 'year', 'source_verification', 'source_hash', 'source_hash_kind', 'original_pdf_bytes_verified', 'publication_identity', 'extraction_status', 'study_group_id', 'study_group_reason'])) as ResearchPaper),
    claims: graph.claims.map(claim => withoutLocalPaths(select(claim, ['claim_id', 'paper_id', 'original_edge_id', 'source_mention_id', 'target_mention_id', 'source_original', 'target_original', 'source', 'target', 'relation_family_id', 'relation_type', 'directed', 'polarity', 'conditions', 'context', 'evidence_type', 'finding_origin', 'review_status'])) as ResearchClaim),
    mappings: graph.mappings.map(mapping => withoutLocalPaths(select(mapping, ['mention_id', 'mapping_id', 'paper_id', 'original_keyword', 'concept_id', 'canonical_label', 'decision_category', 'reason', 'context', 'review_status', 'version', 'view_node_id'])) as ResearchGraph['mappings'][number]),
    views: withoutLocalPaths(Object.fromEntries(Object.entries(graph.views).filter(([name]) => name === 'evidence_full' || name === 'integrated_canonical'))) as ResearchGraph['views'],
    ontology_relations: withoutLocalPaths(graph.ontology_relations) as unknown[],
    local_demo: { publication_approved: false, adapter: 'matdreams-loopback-v1', source_client_sha256: EXPECTED_RESEARCH.clientSha256 },
  }
}

async function checkedPath(root: string, relative: string): Promise<string> {
  const canonicalRoot = await realpath(root)
  const target = await realpath(resolve(root, relative))
  if (!target.startsWith(canonicalRoot + sep)) throw new Error('Local resource is outside the permitted research root.')
  return target
}
async function safeFile(root: string, relative: string): Promise<Buffer> {
  return readFile(await checkedPath(root, relative))
}
async function streamHash(path: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const part of createReadStream(path)) hash.update(part)
  return hash.digest('hex')
}
async function verifiedArtifact(snapshot: LocalSnapshot, relative: string): Promise<Buffer> {
  const expected = snapshot.manifest.files.find(file => file.relative_path === relative)?.sha256
  if (!expected) throw new Error('Requested resource is absent from the frozen artifact manifest.')
  const bytes = await safeFile(resolve(RESEARCH_ROOT, 'exports', EXPECTED_RESEARCH.release), relative)
  assertSha256(bytes, expected)
  return bytes
}
async function loadSnapshot(): Promise<LocalSnapshot> {
  const exportRoot = resolve(RESEARCH_ROOT, 'exports', EXPECTED_RESEARCH.release)
  if (await streamHash(await checkedPath(exportRoot, 'graph.json')) !== EXPECTED_RESEARCH.graphSha256) throw new Error('Frozen graph checksum mismatch.')
  const release = JSON.parse((await safeFile(exportRoot, 'release.json')).toString()) as unknown
  assertIdentity(release)
  const manifestBytes = await safeFile(exportRoot, 'artifact_manifest.json')
  assertSha256(manifestBytes, EXPECTED_RESEARCH.artifactManifestSha256)
  const manifest = JSON.parse(manifestBytes.toString()) as Manifest
  assertIdentity(manifest)
  const buildBytes = await safeFile(RESEARCH_ROOT, 'app/system-chart/build_manifest.json')
  assertSha256(buildBytes, EXPECTED_RESEARCH.buildManifestSha256)
  const build = record(JSON.parse(buildBytes.toString()))
  if (build.release_id !== EXPECTED_RESEARCH.release || build.mapping_version !== EXPECTED_RESEARCH.mapping || build.source_graph_sha256 !== EXPECTED_RESEARCH.graphSha256 || build.client_data_sha256 !== EXPECTED_RESEARCH.clientSha256) throw new Error('Legacy client source identity mismatch.')
  const clientBytes = await safeFile(RESEARCH_ROOT, 'app/system-chart/data.json')
  assertSha256(clientBytes, EXPECTED_RESEARCH.clientSha256)
  const client: unknown = JSON.parse(clientBytes.toString())
  validateResearchGraph(client)
  if (record(client.client_projection).source_graph_sha256 !== EXPECTED_RESEARCH.graphSha256) throw new Error('Legacy client projection has a different source graph.')
  const graph = bootstrapGraph(client)
  const graphJson = Buffer.from(JSON.stringify(graph))
  return { graph, graphJson, graphGzip: gzipSync(graphJson), claims: new Map(client.claims.map(claim => [claim.claim_id, withoutLocalPaths(claim) as ResearchClaim])), papers: new Map(graph.papers.map(paper => [paper.paper_id, paper])), manifest }
}

function reply(response: ServerResponse, status: number, content: string | Buffer, contentType = 'application/json; charset=utf-8'): void {
  response.statusCode = status
  response.setHeader('Content-Type', contentType)
  response.setHeader('Cache-Control', 'no-store, private')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  response.end(content)
}
function json(response: ServerResponse, value: unknown): void { reply(response, 200, JSON.stringify(value)) }

export function localResearchPlugin(): Plugin {
  let snapshotPromise: Promise<LocalSnapshot> | undefined
  return {
    name: 'matdreams-local-research',
    apply: (_config, env) => localResearchEnabled(env),
    config: (config) => ({
      server: { host: '127.0.0.1', port: localResearchPort(config.server?.port), strictPort: true, cors: false, allowedHosts: ['127.0.0.1', 'localhost'], fs: { strict: true, allow: [process.cwd()] } },
    }),
    configResolved(config) {
      if (config.command !== 'serve' || config.mode !== 'local-research' || config.server.host !== '127.0.0.1') throw new Error('Private local research requires the explicit loopback development mode.')
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = request.url ?? ''
        if (!url.startsWith(LOCAL_RESEARCH_PREFIX)) { next(); return }
        if (!trustedLocalRequest(request, server.config.server.port ?? 5177)) { reply(response, 403, '{"error":"Local research requires a same-origin loopback request."}'); return }
        if (request.method !== 'GET') { reply(response, 405, '{"error":"Read-only local resource."}'); return }
        const resource = localResource(url)
        if (!resource) { reply(response, 404, '{"error":"Unknown local resource."}'); return }
        void (async () => {
          snapshotPromise ??= loadSnapshot()
          const snapshot = await snapshotPromise
          const [kind, key] = resource.route.split('/')
          if (kind === 'graph') {
            if (request.headers['accept-encoding']?.includes('gzip')) { response.setHeader('Content-Encoding', 'gzip'); response.setHeader('Vary', 'Accept-Encoding'); reply(response, 200, snapshot.graphGzip) }
            else reply(response, 200, snapshot.graphJson)
          } else if (kind === 'family') {
            const relations = Object.fromEntries(Object.entries(snapshot.graph.views).filter(([name]) => name !== 'manual_baseline').map(([name, view]) => [name, view.relations.find(edge => edge.id === key)]).filter(([, relation]) => relation))
            const family = snapshot.graph.views.integrated_canonical?.relations.find(edge => edge.id === key)
            if (!family) { reply(response, 404, '{"error":"Unknown relation family."}'); return }
            json(response, { release: snapshot.graph.release, relation: family, relations, claims: family.claim_ids.map(id => snapshot.claims.get(id)), papers: family.paper_ids.map(id => snapshot.papers.get(id)) })
          } else if (kind === 'teaching') {
            const teaching = record(JSON.parse((await verifiedArtifact(snapshot, 'teaching_support.json')).toString()))
            assertIdentity(teaching.graph_release)
            json(response, withoutLocalPaths(teaching))
          } else if (kind === 'analysis') {
            const summary = record(JSON.parse((await verifiedArtifact(snapshot, 'convergence/results.json')).toString()))
            if (summary.release_id !== EXPECTED_RESEARCH.release || summary.graph_sha256 !== EXPECTED_RESEARCH.graphSha256) throw new Error('Analysis source mismatch.')
            json(response, { release: snapshot.graph.release, summary, normalization: snapshot.graph.normalization_audit, verification: withoutLocalPaths(JSON.parse((await verifiedArtifact(snapshot, 'independent_review/verification.json')).toString())) })
          } else if (kind === 'documents' && key && Object.hasOwn(DOCUMENTS, key)) {
            const name = DOCUMENTS[key as keyof typeof DOCUMENTS]
            const bytes = await safeFile(RESEARCH_ROOT, `docs/${name}.md`)
            response.setHeader('X-Source-SHA256', createHash('sha256').update(bytes).digest('hex'))
            if (resource.download) response.setHeader('Content-Disposition', `attachment; filename="${name}.md"`)
            reply(response, 200, bytes, 'text/markdown; charset=utf-8')
          } else if (kind === 'figures' && key && Object.hasOwn(FIGURES, key)) {
            reply(response, 200, await verifiedArtifact(snapshot, FIGURES[key as keyof typeof FIGURES]), 'image/png')
          } else if (kind === 'legacy' && key && Object.hasOwn(LEGACY, key)) {
            const bytes = await safeFile(RESEARCH_ROOT, `app/system-chart/${key}`)
            assertSha256(bytes, LEGACY[key as keyof typeof LEGACY])
            reply(response, 200, bytes, 'text/javascript; charset=utf-8')
          } else reply(response, 404, '{"error":"Unknown local resource."}')
        })().catch(() => {
          // Never reflect filesystem exceptions, private paths, or source content.
          reply(response, 503, '{"error":"Frozen RHEA v4 research source is unavailable or failed integrity checks. Check the local checkout and restart the development server."}')
        })
      })
    },
  }
}
