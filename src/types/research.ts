/** Local-only legacy client shape. Separate from the public export contract. */
export interface ResearchConcept {
  concept_id: string
  preferred_label: string
  aliases: string[]
  chart_roles: string[]
  definition: string | null
  definition_status?: string
  definition_review_status?: string
  definition_sources: unknown[]
  physical_concept_type?: string
  identity_facets?: Record<string, unknown>
  broader_ids?: string[]
  related_ids?: string[]
  review_status: string
  [key: string]: unknown
}
export interface ResearchNode {
  id: string
  concept_id: string
  label: string
  role: string
  roles?: string[]
  source_role_node_ids?: string[]
  aliases: string[]
  paper_ids: string[]
  paper_count: number
  review_status: string
  [key: string]: unknown
}
export interface ResearchRelation {
  id: string
  source: string
  target: string
  relation_type: string
  directed: boolean
  polarity: string
  claim_ids: string[]
  paper_ids: string[]
  context_group_ids: string[]
  support: number
  internal_concept_relation?: boolean
  cohort_status?: string
  [key: string]: unknown
}
export interface ResearchClaim {
  claim_id: string
  paper_id: string
  source: string
  target: string
  source_original: string
  target_original: string
  relation_family_id: string
  relation_type: string
  directed: boolean
  polarity: string
  review_status: string
  conditions: unknown
  context: unknown
  evidence?: unknown[]
  [key: string]: unknown
}
export interface ResearchPaper {
  paper_id: string
  title: string | null
  doi: string | null
  doi_url?: string | null
  source_url?: string | null
  year?: number | null
  source_verification?: string
  publication_identity?: { source_confirmed_primary?: boolean; doi_status?: string; [key: string]: unknown }
  [key: string]: unknown
}
export interface ResearchView {
  nodes: ResearchNode[]
  relations: ResearchRelation[]
  display_node_ids: string[]
  display_relation_ids: string[]
  top_by_role: Record<string, string[]>
  [key: string]: unknown
}
export interface ResearchGraph {
  release: { release_id: string; mapping_version: string; graph_sha256: string; schema_version: string; [key: string]: unknown }
  concepts: ResearchConcept[]
  papers: ResearchPaper[]
  claims: ResearchClaim[]
  mappings: { mention_id: string; [key: string]: unknown }[]
  views: Record<string, ResearchView>
  audit: Record<string, unknown>
  normalization_audit: Record<string, unknown>
  ontology_relations: unknown[]
  [key: string]: unknown
}
export interface IndexedView {
  name: string
  raw: ResearchView
  nodes: Map<string, ResearchNode>
  relations: Map<string, ResearchRelation>
  adjacency: Map<string, ResearchRelation[]>
  [key: string]: unknown
}
export interface ResearchIndex {
  views: Record<string, IndexedView>
  concepts: Map<string, ResearchConcept>
  papers: Map<string, ResearchPaper>
  claims: Map<string, ResearchClaim>
}
export interface ResearchDisplay {
  nodes: ResearchNode[]
  edges: ResearchRelation[]
  totalAdjacent?: number
  truncated: number
}
export interface ResearchFilters {
  category: string
  relation: string
  polarity: string
  cohort: string
  context: string
}
export interface LegacyCore {
  indexGraph(graph: ResearchGraph): ResearchIndex
  searchNodes(view: IndexedView, query: string, limit?: number): ResearchNode[]
  filterView(view: IndexedView, filters?: Partial<ResearchFilters>, claims?: Map<string, ResearchClaim>): IndexedView
  neighborhood(view: IndexedView, id: string, limit?: number): ResearchDisplay
  display(view: IndexedView, perRole?: number): ResearchDisplay
  columnNodes(view: IndexedView, nodes: ResearchNode[], role: string): ResearchNode[]
  wrapLabel(label: string, width?: number, lines?: number): string[]
}
export interface TeachingSupport {
  graph_release: { graph_sha256: string; [key: string]: unknown }
  definitions: Record<string, unknown>[]
  [key: string]: unknown
}
export interface LegacyLearning {
  searchConcepts(graph: ResearchGraph, query: string, limit?: number): { total: number; items: ResearchConcept[] }
  definitionAids(concept: ResearchConcept, support: TeachingSupport | null): Record<string, unknown>[]
  nodesForConcept(graph: ResearchGraph, id: string): ResearchNode[]
  [key: string]: unknown
}
