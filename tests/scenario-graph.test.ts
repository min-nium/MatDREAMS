import { describe, expect, it } from 'vitest'
import { findDirectedPath, scenarioRelations } from '../src/data/scenarioGraph'
import type { ScenarioRelation } from '../src/data/scenarioGraph'
import type { ResearchRelation } from '../src/types/research'

// Synthetic traversal fixture; never a scientific graph or research result.
const edge = (id: string, source: string, target: string, directed = true): ResearchRelation => ({
  id, source, target, directed, relation_type: 'synthetic', polarity: 'unknown',
  claim_ids: [], paper_ids: [], context_group_ids: [], support: 0,
})

describe('temporary scenario traversal', () => {
  it('preserves direction and permits reverse traversal only for undirected relations', () => {
    const directed = edge('synthetic-1', 'a', 'b')
    expect(findDirectedPath([directed], 'b', 'a')).toBeNull()
    const undirected = edge('synthetic-2', 'b', 'c', false)
    expect(findDirectedPath([directed, undirected], 'a', 'c')?.nodeIds).toEqual(['a', 'b', 'c'])
    expect(findDirectedPath([undirected], 'c', 'b')?.relations[0]).toBe(undirected)
  })

  it('caps path depth and handles cycles and disconnected concepts', () => {
    const relations = [edge('synthetic-1', 'a', 'b'), edge('synthetic-2', 'b', 'c'), edge('synthetic-3', 'c', 'a')]
    expect(findDirectedPath(relations, 'a', 'c', new Set(), 1)).toBeNull()
    expect(findDirectedPath(relations, 'a', 'missing')).toBeNull()
    expect(findDirectedPath(relations, 'a', 'a')?.relations).toEqual([])
  })

  it('applies additions, removals and hidden concepts without changing source records', () => {
    const original = [edge('synthetic-1', 'a', 'b'), edge('synthetic-2', 'b', 'c')]
    const snapshot = JSON.stringify(original)
    const added: ScenarioRelation = { ...edge('hypothetical-1', 'a', 'c'), hypothetical: true, scenario_note: 'Synthetic test only' }
    const modified = scenarioRelations(original, { removed: new Set(['synthetic-1']), hidden: new Set(['b']), added: [added] })
    expect(modified).toEqual([added])
    expect(findDirectedPath(modified, 'a', 'c')?.relations[0]?.hypothetical).toBe(true)
    expect(findDirectedPath(original, 'a', 'c', new Set(['b']))).toBeNull()
    expect(JSON.stringify(original)).toBe(snapshot)
  })
})
