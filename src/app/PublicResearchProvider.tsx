import type { ReactNode } from 'react'
import type { MaterialSystem } from '../types/graph'

/** Production has no research client, data context or local service connection. */
export function ResearchProvider({ children }: { system: MaterialSystem; children: ReactNode }) {
  return children
}
