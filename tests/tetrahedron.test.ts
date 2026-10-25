import { describe, expect, it } from 'vitest'
import {
  CAMERA_DISTANCE,
  DWELL_MS,
  EDGES,
  MAX_EXTENT_X,
  MAX_EXTENT_Y,
  PERIOD_MS,
  VERTICES,
  approach,
  boxExtent,
  depthOrder,
  isBackEdge,
  labelPosition,
  leaderPoints,
  nodeRadius,
  pointsAttribute,
  projectAll,
  projectVertex,
  yawAt,
} from '../src/components/graph/projection'
import { CORNERS, CYCLE_ORDER, cornerAt } from '../src/components/graph/corners'

const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0), (a[2] ?? 0) - (b[2] ?? 0))

describe('tetrahedron geometry', () => {
  it('is mathematically regular: all six edges are the same length', () => {
    const lengths: number[] = []
    for (let i = 0; i < VERTICES.length; i += 1) {
      for (let j = i + 1; j < VERTICES.length; j += 1) {
        lengths.push(distance(VERTICES[i]!, VERTICES[j]!))
      }
    }

    expect(lengths).toHaveLength(6)
    for (const length of lengths) {
      expect(length).toBeCloseTo(lengths[0]!, 12)
    }
  })

  it('is centred on the origin with unit circumradius', () => {
    for (let axis = 0; axis < 3; axis += 1) {
      const sum = VERTICES.reduce((total, v) => total + (v[axis] ?? 0), 0)
      expect(sum).toBeCloseTo(0, 12)
    }
    for (const vertex of VERTICES) {
      expect(distance(vertex, [0, 0, 0])).toBeCloseTo(1, 12)
    }
  })

  it('declares exactly the six distinct edges of a tetrahedron', () => {
    expect(EDGES).toHaveLength(6)
    const keys = new Set(EDGES.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`))
    expect(keys.size).toBe(6)
    for (const [a, b] of EDGES) expect(a).not.toBe(b)
  })
})

describe('projection', () => {
  const options = { yaw: 0, radius: 160, centerX: 400, centerY: 300 }

  it('never reaches further than the constants used to size the stage', () => {
    let maxX = 0
    let maxY = 0
    let maxRadial = 0
    let minK = Infinity
    let maxK = -Infinity

    for (let tenth = 0; tenth < 3600; tenth += 1) {
      const projected = projectAll({ ...options, yaw: (tenth * Math.PI) / 1800 })
      for (const p of projected) {
        maxX = Math.max(maxX, Math.abs(p.x - 400))
        maxY = Math.max(maxY, Math.abs(p.y - 300))
        maxRadial = Math.max(maxRadial, Math.hypot(p.x - 400, p.y - 300))
        minK = Math.min(minK, p.k)
        maxK = Math.max(maxK, p.k)
      }
    }

    // The stage is a rectangle, so sizing uses per-axis bounds. These must
    // stay upper bounds or the figure clips.
    expect(maxX / options.radius).toBeLessThanOrEqual(MAX_EXTENT_X)
    expect(maxY / options.radius).toBeLessThanOrEqual(MAX_EXTENT_Y)
    // ...and they must stay tight, or the figure is drawn smaller than it could be.
    expect(maxX / options.radius).toBeGreaterThan(MAX_EXTENT_X - 0.01)
    expect(maxY / options.radius).toBeGreaterThan(MAX_EXTENT_Y - 0.01)

    // A vertex reaches further on a diagonal than on either axis. Recorded so
    // nobody mistakes a per-axis bound for a radial one.
    expect(maxRadial / options.radius).toBeCloseTo(1.014, 2)

    // Weak perspective: a gentle depth cue, not a dramatic camera angle.
    expect(minK).toBeGreaterThan(0.86)
    expect(maxK).toBeLessThan(1.19)
    expect(CAMERA_DISTANCE).toBe(6)
  })

  it('places a vertex nearer the viewer at a larger scale than one behind', () => {
    const projected = projectAll(options)
    const front = projected.filter((p) => p.z > 0)
    const back = projected.filter((p) => p.z < 0)
    expect(front.length).toBeGreaterThan(0)
    expect(back.length).toBeGreaterThan(0)
    for (const f of front) for (const b of back) expect(f.k).toBeGreaterThan(b.k)
  })

  it('always classifies some edges as occluded and some as visible', () => {
    for (let deg = 0; deg < 360; deg += 15) {
      const projected = projectAll({ ...options, yaw: (deg * Math.PI) / 180 })
      const back = EDGES.filter(([a, b]) => isBackEdge(projected[a]!, projected[b]!))
      expect(back.length).toBeGreaterThan(0)
      expect(back.length).toBeLessThan(EDGES.length)
    }
  })

  it('paints vertices far to near so close ones overlap distant ones', () => {
    const projected = projectAll(options)
    const order = depthOrder(projected)
    expect(order).toHaveLength(4)
    expect(new Set(order).size).toBe(4)
    for (let i = 1; i < order.length; i += 1) {
      expect(projected[order[i]!]!.z).toBeGreaterThanOrEqual(projected[order[i - 1]!]!.z)
    }
  })

  it('advances yaw with elapsed time and completes one revolution per period', () => {
    expect(yawAt(0)).toBeCloseTo(0, 12)
    expect(yawAt(PERIOD_MS / 2)).toBeCloseTo(Math.PI, 12)
    expect(yawAt(PERIOD_MS)).toBeCloseTo(0, 12)
    expect(PERIOD_MS).toBe(60_000)
    expect(DWELL_MS).toBe(4_500)
  })

  it('clamps node radius within its bounds', () => {
    expect(nodeRadius(1, true)).toBeGreaterThan(nodeRadius(1, false))
    expect(nodeRadius(0.01, false)).toBeGreaterThanOrEqual(6)
    expect(nodeRadius(100, false)).toBeLessThanOrEqual(14)
    expect(nodeRadius(100, true)).toBeLessThanOrEqual(20)
  })

  it('keeps the active vertex the largest at every point in the revolution', () => {
    // Regression: a fixed +2px boost was applied before perspective, so a near
    // inactive vertex (k = 1.187) could render larger than a far active one
    // (k = 0.864), inverting the visual hierarchy mid-rotation.
    let worstActive = Infinity
    let largestInactive = 0

    for (let tenth = 0; tenth < 3600; tenth += 1) {
      const projected = projectAll({ ...options, yaw: (tenth * Math.PI) / 1800 })
      for (const p of projected) {
        worstActive = Math.min(worstActive, nodeRadius(p.k, true))
        largestInactive = Math.max(largestInactive, nodeRadius(p.k, false))
      }
    }

    expect(worstActive).toBeGreaterThan(largestInactive)
  })

  it('offsets labels outboard of the vertex, away from the centroid', () => {
    const p = projectVertex(VERTICES[0]!, options)
    const label = labelPosition(p, 400, 300, 10)
    const toVertex = Math.hypot(p.x - 400, p.y - 300)
    const toLabel = Math.hypot(label.x - 400, label.y - 300)
    expect(toLabel).toBeGreaterThan(toVertex)
  })
})

describe('label clearance', () => {
  it('measures a box edge along a direction, not its maximum projection', () => {
    // Straight up out of a wide, short label: the height governs, not the width.
    expect(boxExtent(0, -1, 50, 9)).toBeCloseTo(9, 6)
    expect(boxExtent(1, 0, 50, 9)).toBeCloseTo(50, 6)
    // The naive support function would give 0.707*50 + 0.707*9 = 41.7 here.
    const diagonal = boxExtent(Math.SQRT1_2, Math.SQRT1_2, 50, 9)
    expect(diagonal).toBeCloseTo(9 * Math.SQRT2, 6)
    expect(diagonal).toBeLessThan(41)
  })
})

describe('leader line routing', () => {
  const from = { x: 300, y: 400 }

  it('leaves the node, turns at right angles, and ends on the dock', () => {
    const points = leaderPoints({
      from,
      nodeRadius: 11,
      to: { x: 700, y: 180 },
      orientation: 'horizontal',
    })

    expect(points).toHaveLength(4)
    expect(points[0]![0]).toBeGreaterThan(from.x + 11)
    expect(points[0]![1]).toBe(from.y)
    expect(points[3]).toEqual([700, 180])

    // Every segment is axis aligned: Manhattan routing, never a diagonal.
    for (let i = 1; i < points.length; i += 1) {
      const [px, py] = points[i - 1]!
      const [cx, cy] = points[i]!
      expect(px === cx || py === cy).toBe(true)
    }
  })

  it('collapses to a straight run when an elbow would be a degenerate jog', () => {
    const points = leaderPoints({
      from,
      nodeRadius: 11,
      to: { x: 700, y: 403 },
      orientation: 'horizontal',
    })
    expect(points).toHaveLength(2)
    expect(points[0]![1]).toBe(points[1]![1])
  })

  it('routes downward in the stacked layout', () => {
    const points = leaderPoints({
      from,
      nodeRadius: 11,
      to: { x: 180, y: 620 },
      orientation: 'vertical',
    })
    expect(points[0]![0]).toBe(from.x)
    expect(points[0]![1]).toBeGreaterThan(from.y + 11)
    expect(points[points.length - 1]).toEqual([180, 620])
  })

  it('keeps the elbow between the node and the dock', () => {
    const points = leaderPoints({
      from,
      nodeRadius: 11,
      to: { x: 700, y: 180 },
      orientation: 'horizontal',
    })
    const elbowX = points[1]![0]
    expect(elbowX).toBeGreaterThan(from.x)
    expect(elbowX).toBeLessThan(700)
  })

  it('serialises points without scientific notation', () => {
    expect(pointsAttribute([[3, 4.5], [1.25, 2]])).toBe('3.00,4.50 1.25,2.00')
    // Tiny values must not serialise as "1e-7": SVG would reject the attribute.
    expect(pointsAttribute([[1e-7, 2]])).toBe('0.00,2.00')
  })
})

describe('frame-rate independent easing', () => {
  it('approaches the target and never overshoots', () => {
    let value = 0
    for (let i = 0; i < 200; i += 1) value = approach(value, 100, 16)
    expect(value).toBeGreaterThan(99.9)
    expect(value).toBeLessThanOrEqual(100)
  })

  it('reaches a similar place whether stepped coarsely or finely', () => {
    let coarse = 0
    let fine = 0
    for (let i = 0; i < 10; i += 1) coarse = approach(coarse, 100, 32)
    for (let i = 0; i < 20; i += 1) fine = approach(fine, 100, 16)
    expect(Math.abs(coarse - fine)).toBeLessThan(0.5)
  })
})

describe('corner definitions', () => {
  it('names the four corners of the materials paradigm', () => {
    expect(CORNERS.map((c) => c.label)).toEqual([
      'Processing',
      'Structure',
      'Property',
      'Performance',
    ])
  })

  it('maps each corner to a distinct vertex', () => {
    const used = CORNERS.map((c) => c.vertexIndex)
    expect(new Set(used).size).toBe(VERTICES.length)
    for (const index of used) {
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(VERTICES.length)
    }
  })

  it('ships no invented scientific content', () => {
    // AGENTS.md forbids inventing scientific content. Every corner must stay
    // in its pending-review state until the research team supplies text.
    for (const corner of CORNERS) {
      expect(corner.explanation).toBeNull()
    }
  })

  it('cycles through every corner exactly once', () => {
    expect([...CYCLE_ORDER].sort()).toEqual([0, 1, 2, 3])
  })

  it('wraps out-of-range corner lookups instead of throwing', () => {
    expect(cornerAt(4).id).toBe(CORNERS[0]!.id)
    expect(cornerAt(-1).id).toBe(CORNERS[3]!.id)
  })
})

describe('leader routing around the figure', () => {
  it('leaves vertically when the node is on the far side from the dock', () => {
    const points = leaderPoints({
      from: { x: 200, y: 400 },
      nodeRadius: 11,
      to: { x: 700, y: 150 },
      orientation: 'horizontal',
      exitVertical: true,
    })

    // First move is vertical: x is unchanged leaving the node.
    expect(points[0]![0]).toBe(200)
    expect(points[0]![1]).toBeLessThan(400 - 11)
    // The long horizontal run sits at the dock's height, clear of the figure.
    expect(points[points.length - 2]![1]).toBe(150)
    expect(points[points.length - 1]).toEqual([700, 150])
    for (let i = 1; i < points.length; i += 1) {
      const [px, py] = points[i - 1]!
      const [cx, cy] = points[i]!
      expect(px === cx || py === cy).toBe(true)
    }
  })

  it('still collapses to a straight run regardless of exit preference', () => {
    const points = leaderPoints({
      from: { x: 200, y: 400 },
      nodeRadius: 11,
      to: { x: 700, y: 402 },
      orientation: 'horizontal',
      exitVertical: true,
    })
    expect(points).toHaveLength(2)
  })
})
