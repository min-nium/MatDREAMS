/**
 * The four corners of the materials tetrahedron.
 *
 * SCIENTIFIC INTEGRITY — read before editing.
 *
 * This figure is a conceptual diagram of the materials paradigm. It is NOT the
 * evidence graph built from research papers, and nothing about it is derived
 * from `public/data/`.
 *
 * The explanatory text and the materials-science example for each corner are
 * content the research team supplies. They have not been supplied, so every
 * corner carries `explanation: null` and the panel renders its pending-review
 * state. Do not write definitions or examples here: AGENTS.md forbids inventing
 * scientific content, and a plausible-looking placeholder is worse than a blank
 * because it reads as reviewed fact.
 *
 * Terminology is used verbatim as supplied. "Property" stays singular; it is
 * not silently normalised to "Properties".
 */

export interface Corner {
  /** Stable id, used for tab/panel ARIA wiring and as a React key. */
  readonly id: string
  /** Label shown on the figure and in the panel. Research team's wording. */
  readonly label: string
  /** Index into `VERTICES` in projection.ts. Chosen for label separation. */
  readonly vertexIndex: number
  /**
   * Supplied explanatory content, or null while none has been approved.
   * Null renders the pending-review state. Never fill this in locally.
   */
  readonly explanation: null | {
    readonly definition: string
    readonly example: string
    readonly source: string
  }
}

/**
 * Vertex assignment is a presentation parameter chosen so the four labels fall
 * into distinct quadrants at the resting yaw. It carries no scientific claim.
 */
export const CORNERS: readonly Corner[] = [
  { id: 'processing', label: 'Processing', vertexIndex: 2, explanation: null },
  { id: 'structure', label: 'Structure', vertexIndex: 1, explanation: null },
  { id: 'property', label: 'Property', vertexIndex: 3, explanation: null },
  { id: 'performance', label: 'Performance', vertexIndex: 0, explanation: null },
]

/**
 * The order the panel steps through corners while auto-advancing.
 *
 * This is a reading sequence for the explanations, not a causal claim. It is
 * deliberately not reinforced with arrowheads, edge animation or corner
 * numbering: no supplied relation record backs these six edges, so asserting a
 * direction would be an inference the frontend is not entitled to make.
 */
export const CYCLE_ORDER: readonly number[] = [0, 1, 2, 3]

export function cornerAt(index: number): Corner {
  const corner = CORNERS[((index % CORNERS.length) + CORNERS.length) % CORNERS.length]
  if (!corner) {
    throw new Error('MatDREAMS tetrahedron corner index is out of range.')
  }
  return corner
}
