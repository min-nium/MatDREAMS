export interface PercentileBand {
  p05: number
  median: number
  p95: number
}
export interface ResearchCheckpoint {
  n_papers: number
  criterion_success_fraction: number
  relation_coverage: PercentileBand
  core_retention_10: PercentileBand
  core_retention_20: PercentileBand
  core_retention_50: PercentileBand
}
export interface ResearchAnalysisSummary {
  release_id: string
  graph_sha256: string
  scopes: {
    id: string
    paper_count: number
    relation_count: number
    node_count: number
    checkpoints: ResearchCheckpoint[]
    verdict: { status: string; candidate_minimum: number | null }
  }[]
}
export interface ResearchAnalysisResponse {
  summary: ResearchAnalysisSummary
  normalization: Record<string, unknown>
  verification: { status?: string; graph_sha256?: string; checks?: Record<string, unknown>; scientific_acceptance?: string }
}

export function checkedAnalysis(value: ResearchAnalysisResponse, expectedSha: string, releaseId: string): ResearchAnalysisResponse {
  if (value.summary?.graph_sha256 !== expectedSha || value.summary.release_id !== releaseId || !Array.isArray(value.summary.scopes) || !value.summary.scopes.some((scope) => scope.id === 'all' && Array.isArray(scope.checkpoints))) {
    throw new Error('Analysis release identity or full-graph summary is invalid. No results displayed.')
  }
  if (value.verification?.graph_sha256 && value.verification.graph_sha256 !== expectedSha) {
    throw new Error('The saved verification receipt belongs to another graph.')
  }
  return value
}

export function aggregateNumber(record: Record<string, unknown> | undefined, key: string): string {
  const value = record?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('en') : 'Not established'
}

export function supportDistribution(relations: readonly { paper_ids: readonly string[] }[]): [number, number][] {
  const counts = new Map<number, number>()
  for (const relation of relations) {
    const support = new Set(relation.paper_ids).size
    counts.set(support, (counts.get(support) ?? 0) + 1)
  }
  return [...counts.entries()].sort(([a], [b]) => a - b)
}
