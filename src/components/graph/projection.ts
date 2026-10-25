/**
 * Materials tetrahedron geometry and projection.
 *
 * Pure and synchronous: no DOM, no React, no dependency. Specified in
 * docs/design/HOMEPAGE_DESIGN_SPEC.md sections 4 and 8.
 *
 * Four vertices and six edges do not justify a 3D runtime. The decisive reason
 * for drawing this with SVG and a hand-written projection is the leader line:
 * the projected 2-D vertex coordinate is produced as a by-product of placing
 * the vertex, in the same coordinate space the leader is drawn in.
 */

export type Vec3 = readonly [number, number, number]

/**
 * A regular tetrahedron: four alternating vertices of a cube, normalised so the
 * circumradius is exactly 1. Scaling by R therefore places every vertex R units
 * from the centre before projection.
 */
const INV_SQRT3 = 1 / Math.sqrt(3)

export const VERTICES: readonly Vec3[] = [
  [INV_SQRT3, INV_SQRT3, INV_SQRT3],
  [INV_SQRT3, -INV_SQRT3, -INV_SQRT3],
  [-INV_SQRT3, INV_SQRT3, -INV_SQRT3],
  [-INV_SQRT3, -INV_SQRT3, INV_SQRT3],
]

export const EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]

/** Viewer looks slightly down on the figure. */
export const TILT = (-16 * Math.PI) / 180

/**
 * Maximum projected extent from the centre, per axis, as a fraction of R,
 * measured over a full revolution at TILT and CAMERA_DISTANCE.
 *
 * These are per-axis bounds because the stage is a rectangle. The maximum
 * *radial* distance is larger (1.0142 R) — a vertex can reach that far on a
 * diagonal — so using the radial figure to size a rectangular box would waste
 * space, and using a per-axis figure as if it were radial would understate the
 * reach. `tests/tetrahedron.test.ts` pins all three numbers.
 */
export const MAX_EXTENT_X = 0.847
export const MAX_EXTENT_Y = 0.871

/**
 * Camera distance as a multiple of R. Chosen by measurement: at 6R the
 * perspective factor stays within 0.864–1.187 across a full revolution, a
 * gentle depth cue. 4R exaggerates (0.809–1.309); 8R flattens (0.894–1.134).
 */
export const CAMERA_DISTANCE = 6

/** One revolution per 60 s, and 4.5 s per active corner. Both approved. */
export const PERIOD_MS = 60_000
export const DWELL_MS = 4_500

/** Yaw used when motion is suppressed: all four labels separate cleanly. */
export const STATIC_YAW = (24 * Math.PI) / 180

export interface ProjectedVertex {
  /** Screen x, in the same units as the SVG viewBox. */
  readonly x: number
  /** Screen y, already flipped for SVG's downward axis. */
  readonly y: number
  /** Depth after rotation. Positive is toward the viewer. */
  readonly z: number
  /** Perspective scale factor at this depth. */
  readonly k: number
}

export interface ProjectionOptions {
  readonly yaw: number
  readonly radius: number
  readonly centerX: number
  readonly centerY: number
  readonly tilt?: number
}

export function projectVertex(v: Vec3, options: ProjectionOptions): ProjectedVertex {
  const { yaw, radius, centerX, centerY, tilt = TILT } = options
  const [vx, vy, vz] = v

  // 1. spin about Y
  const sy = Math.sin(yaw)
  const cy = Math.cos(yaw)
  const x1 = vx * cy + vz * sy
  const z1 = -vx * sy + vz * cy

  // 2. fixed tilt about X
  const st = Math.sin(tilt)
  const ct = Math.cos(tilt)
  const y2 = vy * ct - z1 * st
  const z2 = vy * st + z1 * ct

  // 3. scale
  const x = x1 * radius
  const y = y2 * radius
  const z = z2 * radius

  // 4. weak perspective
  const d = CAMERA_DISTANCE * radius
  const k = d / (d - z)

  return { x: centerX + k * x, y: centerY - k * y, z, k }
}

export function projectAll(options: ProjectionOptions): ProjectedVertex[] {
  return VERTICES.map((v) => projectVertex(v, options))
}

/** Yaw for a given elapsed time. Time-based so speed is frame-rate independent. */
export function yawAt(elapsedMs: number, periodMs: number = PERIOD_MS): number {
  return ((elapsedMs % periodMs) / periodMs) * 2 * Math.PI
}

/** An edge is "back" when its midpoint lies behind the centroid. */
export function isBackEdge(a: ProjectedVertex, b: ProjectedVertex): boolean {
  return (a.z + b.z) / 2 < 0
}

const NODE_RADIUS_REST = 9
const NODE_RADIUS_MIN = 6
const NODE_RADIUS_MAX = 14
/**
 * The active vertex is scaled after perspective, not before.
 *
 * Adding a fixed 2px to the base radius was not enough: perspective varies the
 * radius by ±16%, so a near inactive vertex (k = 1.187) rendered *larger* than
 * a far active one (k = 0.864), which inverts the hierarchy. Scaling the
 * projected radius keeps the active vertex the largest at every yaw —
 * 1.5 x 0.864 = 1.30 against a 1.187 maximum for the rest.
 */
const NODE_ACTIVE_SCALE = 1.5
const NODE_ACTIVE_MIN = 10
const NODE_ACTIVE_MAX = 20

/** Radius of the ring that marks the active vertex, as an offset from it. */
export const RETICLE_GAP = 6

export function nodeRadius(k: number, active: boolean): number {
  const projected = NODE_RADIUS_REST * k
  if (active) {
    return Math.min(NODE_ACTIVE_MAX, Math.max(NODE_ACTIVE_MIN, projected * NODE_ACTIVE_SCALE))
  }
  return Math.min(NODE_RADIUS_MAX, Math.max(NODE_RADIUS_MIN, projected))
}

/** Paint order: far vertices first, so near ones overlap them. */
export function depthOrder(projected: readonly ProjectedVertex[]): number[] {
  return projected
    .map((p, index) => ({ index, z: p.z }))
    .sort((a, b) => a.z - b.z)
    .map((entry) => entry.index)
}

export const LABEL_OFFSET = 10

/**
 * Distance from a rectangle's centre to its edge along a unit direction.
 *
 * Used to clear a corner label from its node. The naive support function
 * (halfW·|ux| + halfH·|uy|) overestimates badly on diagonals — for a wide,
 * short label it pushes the text far further out than the box actually
 * extends — so this solves the ray/box intersection instead.
 */
export function boxExtent(ux: number, uy: number, halfWidth: number, halfHeight: number): number {
  const tx = Math.abs(ux) > 1e-6 ? halfWidth / Math.abs(ux) : Number.POSITIVE_INFINITY
  const ty = Math.abs(uy) > 1e-6 ? halfHeight / Math.abs(uy) : Number.POSITIVE_INFINITY
  return Math.min(tx, ty)
}

/**
 * Label position: outboard of the vertex along the vector from the projected
 * centroid, so labels never sit on top of an edge.
 */
export function labelPosition(
  p: ProjectedVertex,
  centerX: number,
  centerY: number,
  radius: number,
): { x: number; y: number } {
  const dx = p.x - centerX
  const dy = p.y - centerY
  const length = Math.hypot(dx, dy) || 1
  const distance = radius + LABEL_OFFSET
  return { x: p.x + (dx / length) * distance, y: p.y + (dy / length) * distance }
}

export type LeaderOrientation = 'horizontal' | 'vertical'

export interface LeaderInput {
  readonly from: { readonly x: number; readonly y: number }
  readonly nodeRadius: number
  readonly to: { readonly x: number; readonly y: number }
  readonly orientation: LeaderOrientation
  /**
   * Leave the node vertically rather than horizontally.
   *
   * Used when the active vertex is on the far side of the figure from the
   * dock: running horizontally from there would drag the leader straight
   * across the tetrahedron, while leaving vertically puts the long horizontal
   * run at the dock's height, clear of the figure.
   */
  readonly exitVertical?: boolean
}

const LEADER_GAP = 6
const LEADER_MIN_RUN = 30
const LEADER_STRAIGHT_TOLERANCE = 8
const ELBOW_FRACTION = 0.72

/**
 * Stepped right-angled (Manhattan) routing from the active vertex to the panel
 * anchor. Collapses to a straight line when the offset is too small to make a
 * legible elbow, which avoids a degenerate 1px jog.
 */
export function leaderPoints(input: LeaderInput): Array<[number, number]> {
  const { from, to, orientation } = input
  const r = input.nodeRadius

  if (orientation === 'vertical') {
    const dir = Math.sign(to.y - from.y) || 1
    const start: [number, number] = [from.x, from.y + (r + LEADER_GAP) * dir]
    if (Math.abs(to.x - from.x) < LEADER_STRAIGHT_TOLERANCE) {
      return [start, [from.x, to.y]]
    }
    const span = to.y - start[1]
    const elbow = start[1] + span * ELBOW_FRACTION
    return [start, [from.x, elbow], [to.x, elbow], [to.x, to.y]]
  }

  const dir = Math.sign(to.x - from.x) || 1

  if (Math.abs(to.y - from.y) < LEADER_STRAIGHT_TOLERANCE) {
    return [[from.x + (r + LEADER_GAP) * dir, from.y], [to.x, from.y]]
  }

  if (input.exitVertical) {
    const vdir = Math.sign(to.y - from.y) || 1
    return [[from.x, from.y + (r + LEADER_GAP) * vdir], [from.x, to.y], [to.x, to.y]]
  }

  const start: [number, number] = [from.x + (r + LEADER_GAP) * dir, from.y]

  // Elbow sits close to the panel so the long vertical run hugs the panel
  // edge instead of cutting across the figure.
  const rawElbow = from.x + (to.x - from.x) * ELBOW_FRACTION
  const nearBound = from.x + (r + LEADER_MIN_RUN) * dir
  const farBound = to.x - LEADER_MIN_RUN * dir
  const lo = Math.min(nearBound, farBound)
  const hi = Math.max(nearBound, farBound)
  const elbow = Math.min(hi, Math.max(lo, rawElbow))

  return [start, [elbow, from.y], [elbow, to.y], [to.x, to.y]]
}

export function pointsAttribute(points: ReadonlyArray<readonly [number, number]>): string {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

/**
 * Frame-rate independent exponential approach, used to ease the leader's panel
 * end toward a new dock while its node end keeps tracking the vertex exactly.
 */
export function approach(current: number, target: number, deltaMs: number, tau = 90): number {
  if (tau <= 0) return target
  return current + (target - current) * (1 - Math.exp(-deltaMs / tau))
}
