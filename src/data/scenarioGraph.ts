import type { ResearchRelation } from '../types/research'

export interface ScenarioRelation extends ResearchRelation {
  hypothetical: true
  scenario_note: string
}

export interface ScenarioChanges {
  removed: ReadonlySet<string>
  hidden: ReadonlySet<string>
  added: readonly ScenarioRelation[]
}

export interface GraphPath {
  nodeIds: string[]
  relations: ResearchRelation[]
}

/** User overlays are a presentation copy. The source graph is never edited. */
export function scenarioRelations(
  original: readonly ResearchRelation[],
  changes: ScenarioChanges,
): ResearchRelation[] {
  return [...original.filter((edge) => !changes.removed.has(edge.id)), ...changes.added]
    .filter((edge) => !changes.hidden.has(edge.source) && !changes.hidden.has(edge.target))
}

/**
 * Bounded breadth-first traversal of the supplied edge directions.
 * Reachability establishes neither condition compatibility nor a processing route.
 */
export function findDirectedPath(
  relations: readonly ResearchRelation[],
  source: string,
  target: string,
  hidden: ReadonlySet<string> = new Set(),
  maxHops = 8,
): GraphPath | null {
  if (!source || !target || hidden.has(source) || hidden.has(target)) return null
  if (source === target) return { nodeIds: [source], relations: [] }
  const adjacency = new Map<string, { node: string; relation: ResearchRelation }[]>()
  const connect = (from: string, to: string, relation: ResearchRelation) => {
    const next = adjacency.get(from) ?? []
    next.push({ node: to, relation })
    adjacency.set(from, next)
  }
  for (const relation of relations) {
    if (hidden.has(relation.source) || hidden.has(relation.target)) continue
    connect(relation.source, relation.target, relation)
    if (!relation.directed && relation.source !== relation.target) {
      connect(relation.target, relation.source, relation)
    }
  }
  const queue = [{ node: source, depth: 0 }]
  const previous = new Map<string, { node: string; relation: ResearchRelation }>()
  const visited = new Set([source])
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor]
    if (!current || current.depth >= maxHops) continue
    for (const next of adjacency.get(current.node) ?? []) {
      if (visited.has(next.node)) continue
      visited.add(next.node)
      previous.set(next.node, { node: current.node, relation: next.relation })
      if (next.node === target) {
        const nodeIds = [target]
        const edges: ResearchRelation[] = []
        let node = target
        while (node !== source) {
          const step = previous.get(node)
          if (!step) return null
          nodeIds.unshift(step.node)
          edges.unshift(step.relation)
          node = step.node
        }
        return { nodeIds, relations: edges }
      }
      queue.push({ node: next.node, depth: current.depth + 1 })
    }
  }
  return null
}
