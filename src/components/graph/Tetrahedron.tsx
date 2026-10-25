import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { CORNERS } from './corners'
import {
  EDGES,
  MAX_EXTENT_X,
  MAX_EXTENT_Y,
  boxExtent,
  PERIOD_MS,
  STATIC_YAW,
  approach,
  depthOrder,
  isBackEdge,
  labelPosition,
  leaderPoints,
  RETICLE_GAP,
  nodeRadius,
  pointsAttribute,
  projectAll,
  yawAt,
} from './projection'
import type { LeaderOrientation, ProjectedVertex } from './projection'

interface TetrahedronProps {
  activeIndex: number
  onSelect: (index: number, viaPointer: boolean) => void
  rotating: boolean
  reducedMotion: boolean
  orientation: LeaderOrientation
  /** Element the leader line docks into — the panel title block. */
  dockRef: RefObject<HTMLElement | null>
  /** The panel itself, used for the horizontal/vertical edge of the dock. */
  panelRef: RefObject<HTMLElement | null>
  /** Called with the dock's offset inside the panel so the notch can be placed. */
  onDockMeasured: (offset: number) => void
  panelId: string
  /**
   * Narrow viewports cannot fit labels beside the figure: a horizontal label
   * needs ~100px of clearance each side, which at phone width leaves no room
   * for the tetrahedron itself. The corners then become a chip row beneath it.
   */
  compactLabels: boolean
}

const R_MIN = 92
const R_MAX = 268
/**
 * Room reserved outside the figure for corner labels. Horizontal is much
 * larger because the labels are wide and short: "PERFORMANCE" is ~80px at the
 * label size, and its centre sits LABEL_OFFSET beyond the vertex.
 */
const LABEL_PAD_X = 84
const LABEL_PAD_Y = 46
/**
 * In chip mode the labels are not beside the figure, so reserving label
 * clearance there shrank the drawing by about 40% for nothing.
 */
const CHIP_PAD_X = 16
const CHIP_PAD_Y = 16
const DOCK_EDGE_INSET = 14
const SETTLE_EPSILON = 0.15
const MAX_FRAME_MS = 64

function radiusFor(width: number, height: number, compact: boolean): number {
  const padX = compact ? CHIP_PAD_X : LABEL_PAD_X
  const padY = compact ? CHIP_PAD_Y : LABEL_PAD_Y
  const byWidth = (width / 2 - padX) / MAX_EXTENT_X
  const byHeight = (height / 2 - padY) / MAX_EXTENT_Y
  return Math.max(R_MIN, Math.min(R_MAX, byWidth, byHeight))
}

export function Tetrahedron({
  activeIndex,
  onSelect,
  rotating,
  reducedMotion,
  orientation,
  dockRef,
  panelRef,
  onDockMeasured,
  panelId,
  compactLabels,
}: TetrahedronProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const edgeRefs = useRef<Array<SVGLineElement | null>>([])
  const nodeRefs = useRef<Array<SVGCircleElement | null>>([])
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const leaderRef = useRef<SVGPolylineElement>(null)
  const reticleRef = useRef<SVGCircleElement>(null)

  const [size, setSize] = useState({ width: 0, height: 0 })

  const activeRef = useRef(activeIndex)
  const rotatingRef = useRef(rotating)
  const orientationRef = useRef(orientation)
  const reducedRef = useRef(reducedMotion)
  const compactRef = useRef(compactLabels)
  const elapsedRef = useRef(0)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const dockTargetRef = useRef({ x: 0, y: 0 })
  const activeNodeCentreRef = useRef<number | null>(null)
  const dockEasedRef = useRef({ x: 0, y: 0, initialised: false })
  const suspendedRef = useRef(false)
  const hoverRef = useRef(false)
  const focusRef = useRef(false)

  // Mirrored into refs so the frame loop can read the latest values without
  // being re-created every render. Declared first so it runs before the layout
  // effects below that call draw().
  useLayoutEffect(() => {
    activeRef.current = activeIndex
    orientationRef.current = orientation
    reducedRef.current = reducedMotion
    compactRef.current = compactLabels
  }, [activeIndex, orientation, reducedMotion, compactLabels])

  /* ---- Dock measurement -------------------------------------------------- */

  const measureDock = useCallback(() => {
    const svg = svgRef.current
    const dock = dockRef.current
    const panel = panelRef.current
    if (!svg || !dock || !panel) return

    const svgBox = svg.getBoundingClientRect()
    const dockBox = dock.getBoundingClientRect()
    const panelBox = panel.getBoundingClientRect()

    // In chip mode the corner's label is the chip, not a mark on the figure,
    // so the leader connects the node to its chip. Running it on to the panel
    // would mean crossing the chip row, which is noise rather than meaning.
    if (compactRef.current) {
      const chip = buttonRefs.current[activeRef.current]
      if (chip) {
        const chipBox = chip.getBoundingClientRect()
        dockTargetRef.current = {
          x: chipBox.left + chipBox.width / 2 - svgBox.left,
          y: chipBox.top - svgBox.top,
        }
        onDockMeasured(0)
        return
      }
    }

    // Keep the dock inside the drawing band. The SVG draws with overflow
    // visible so the leader can reach the panel, which also means an
    // unclamped dock lets the horizontal run cross the heading and standfirst
    // above the figure. Clamping guarantees that cannot happen at any viewport
    // or copy length; the panel notch is driven from the same number, so the
    // two stay together.
    const clampDockY = (y: number) =>
      Math.min(Math.max(y, DOCK_EDGE_INSET), Math.max(DOCK_EDGE_INSET, svgBox.height - DOCK_EDGE_INSET))

    if (orientationRef.current === 'vertical') {
      // Dock beneath the active vertex rather than at the panel's midpoint.
      // Docking at the midpoint produced a long diagonal dog-leg across the
      // whole figure on tablet; tracking the vertex keeps the stem near
      // vertical and short.
      const active = activeNodeCentreRef.current
      const inset = 48
      const min = inset
      const max = Math.max(inset, panelBox.width - inset)
      const localX = active === null ? panelBox.width / 2 : active - (panelBox.left - svgBox.left)
      const clamped = Math.min(max, Math.max(min, localX))
      dockTargetRef.current = {
        x: panelBox.left + clamped - svgBox.left,
        y: panelBox.top - svgBox.top,
      }
      onDockMeasured(clamped)
    } else {
      const dockY = clampDockY(dockBox.top + dockBox.height / 2 - svgBox.top)
      dockTargetRef.current = { x: panelBox.left - svgBox.left, y: dockY }
      onDockMeasured(dockY + svgBox.top - panelBox.top)
    }
  }, [dockRef, panelRef, onDockMeasured])

  /* ---- Drawing ----------------------------------------------------------- */

  const draw = useCallback(
    (deltaMs: number): boolean => {
      const { width, height } = size
      if (width <= 0 || height <= 0) return true

      const radius = radiusFor(width, height, compactRef.current)
      const centerX = width / 2
      const centerY = height / 2
      const yaw = reducedRef.current ? STATIC_YAW : yawAt(elapsedRef.current, PERIOD_MS)

      const projected: ProjectedVertex[] = projectAll({ yaw, radius, centerX, centerY })

      // Edges: back edges dashed and lighter, drawn before the front ones.
      EDGES.forEach((edge, index) => {
        const line = edgeRefs.current[index]
        const a = projected[edge[0]]
        const b = projected[edge[1]]
        if (!line || !a || !b) return
        line.setAttribute('x1', a.x.toFixed(2))
        line.setAttribute('y1', a.y.toFixed(2))
        line.setAttribute('x2', b.x.toFixed(2))
        line.setAttribute('y2', b.y.toFixed(2))
        const back = isBackEdge(a, b)
        line.setAttribute('class', back ? 'tetra__edge tetra__edge--back' : 'tetra__edge')
      })

      const activeCorner = CORNERS[activeRef.current]
      const activeVertexIndex = activeCorner ? activeCorner.vertexIndex : 0

      CORNERS.forEach((corner, cornerIndex) => {
        const p = projected[corner.vertexIndex]
        const circle = nodeRefs.current[cornerIndex]
        const button = buttonRefs.current[cornerIndex]
        if (!p) return

        const isActive = cornerIndex === activeRef.current
        const r = nodeRadius(p.k, isActive)

        if (circle) {
          circle.setAttribute('cx', p.x.toFixed(2))
          circle.setAttribute('cy', p.y.toFixed(2))
          circle.setAttribute('r', r.toFixed(2))
          const classes = ['tetra__node']
          if (isActive) classes.push('tetra__node--active')
          else if (p.z < 0) classes.push('tetra__node--back')
          circle.setAttribute('class', classes.join(' '))
        }

        if (button && compactRef.current) {
          button.style.transform = ''
        } else if (button) {
          // Push the label out by its own half-extent along the radial
          // direction, or a wide label sits on top of its node. Measure the
          // text span, not the button: the button is padded out to a 44px
          // touch target, which would push labels much too far.
          const dx = p.x - centerX
          const dy = p.y - centerY
          const length = Math.hypot(dx, dy) || 1
          const text = button.firstElementChild as HTMLElement | null
          const halfW = (text ? text.offsetWidth : button.offsetWidth) / 2
          const halfH = (text ? text.offsetHeight : button.offsetHeight) / 2
          const selfExtent = boxExtent(dx / length, dy / length, halfW, halfH)
          const label = labelPosition(p, centerX, centerY, r + selfExtent)
          button.style.transform = `translate3d(${label.x.toFixed(2)}px, ${label.y.toFixed(2)}px, 0) translate(-50%, -50%)`
        }
      })

      // Vertices are painted far-to-near so close ones overlap distant ones.
      const order = depthOrder(projected)
      const svg = svgRef.current
      if (svg) {
        const layer = svg.querySelector('.tetra__nodes')
        if (layer) {
          for (const vertexIndex of order) {
            const cornerIndex = CORNERS.findIndex((c) => c.vertexIndex === vertexIndex)
            const circle = nodeRefs.current[cornerIndex]
            if (circle) layer.appendChild(circle)
          }
        }
      }

      // Reticle: a hairline ring that marks the selected vertex as targeted.
      const activePoint = projected[activeVertexIndex]
      if (activePoint) activeNodeCentreRef.current = activePoint.x
      const reticle = reticleRef.current
      if (reticle && activePoint) {
        reticle.setAttribute('cx', activePoint.x.toFixed(2))
        reticle.setAttribute('cy', activePoint.y.toFixed(2))
        reticle.setAttribute('r', (nodeRadius(activePoint.k, true) + RETICLE_GAP).toFixed(2))
      }

      // Leader: node end tracks the vertex exactly, panel end eases to its dock.
      const leader = leaderRef.current
      let settled = true

      if (activePoint && leader) {
        const target = dockTargetRef.current
        const eased = dockEasedRef.current
        if (!eased.initialised) {
          eased.x = target.x
          eased.y = target.y
          eased.initialised = true
        } else if (reducedRef.current) {
          eased.x = target.x
          eased.y = target.y
        } else {
          eased.x = approach(eased.x, target.x, deltaMs)
          eased.y = approach(eased.y, target.y, deltaMs)
          if (Math.abs(eased.x - target.x) > SETTLE_EPSILON || Math.abs(eased.y - target.y) > SETTLE_EPSILON) {
            settled = false
          }
        }

        const points = leaderPoints({
          from: { x: activePoint.x, y: activePoint.y },
          nodeRadius: nodeRadius(activePoint.k, true),
          to: { x: eased.x, y: eased.y },
          orientation: orientationRef.current,
          // Node on the far side of the figure from the dock: leave vertically
          // so the horizontal run clears the tetrahedron instead of crossing it.
          exitVertical: Math.sign(eased.x - centerX) === Math.sign(centerX - activePoint.x),
        })
        leader.setAttribute('points', pointsAttribute(points))
      }

      return settled
    },
    [size],
  )

  /* ---- Frame loop --------------------------------------------------------- */

  const ensureLoop = useCallback(() => {
    if (rafRef.current || suspendedRef.current) return
    lastRef.current = 0
    const frame = (now: number) => {
      const previous = lastRef.current || now
      const delta = Math.min(now - previous, MAX_FRAME_MS)
      lastRef.current = now

      const spinning = rotatingRef.current && !reducedRef.current
      if (spinning) elapsedRef.current += delta

      const settled = draw(delta)

      if (!suspendedRef.current && (spinning || !settled)) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        rafRef.current = 0
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }, [draw])

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  // Rotation pauses on hover, focus-within, manual pause, reduced motion,
  // off-screen and hidden tab.
  useEffect(() => {
    rotatingRef.current = rotating && !hoverRef.current && !focusRef.current && !reducedMotion
    if (rotatingRef.current) ensureLoop()
  }, [rotating, reducedMotion, ensureLoop])

  useLayoutEffect(() => {
    const stage = svgRef.current
    if (!stage) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const box = entry.contentRect
      setSize({ width: box.width, height: box.height })
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    measureDock()
    dockEasedRef.current.initialised = false
    draw(0)
    ensureLoop()
  }, [size, orientation, compactLabels, measureDock, draw, ensureLoop])

  useLayoutEffect(() => {
    measureDock()
    draw(0)
    ensureLoop()
  }, [activeIndex, measureDock, draw, ensureLoop])

  useEffect(() => {
    const onResize = () => {
      measureDock()
      ensureLoop()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measureDock, ensureLoop])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      const visible = entry ? entry.isIntersecting : true
      suspendedRef.current = !visible || document.hidden
      if (suspendedRef.current) stopLoop()
      else ensureLoop()
    })
    observer.observe(stage)

    const onVisibility = () => {
      suspendedRef.current = document.hidden
      if (suspendedRef.current) stopLoop()
      else ensureLoop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ensureLoop, stopLoop])

  useEffect(() => stopLoop, [stopLoop])

  /* ---- Interaction -------------------------------------------------------- */

  const setPaused = useCallback(
    (hover: boolean | null, focus: boolean | null) => {
      if (hover !== null) hoverRef.current = hover
      if (focus !== null) focusRef.current = focus
      rotatingRef.current = rotating && !hoverRef.current && !focusRef.current && !reducedMotion
      if (rotatingRef.current) ensureLoop()
    },
    [rotating, reducedMotion, ensureLoop],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return
    event.preventDefault()

    const count = CORNERS.length
    let next = activeIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (activeIndex + 1) % count
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (activeIndex - 1 + count) % count
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = count - 1

    onSelect(next, false)
    buttonRefs.current[next]?.focus()
  }

  const { width, height } = size

  return (
    <div
      className={compactLabels ? 'tetra tetra--chips' : 'tetra'}
      ref={stageRef}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setPaused(true, null)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') setPaused(false, null)
      }}
      onFocusCapture={() => setPaused(null, true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(null, false)
      }}
    >
      <svg
        className="tetra__svg"
        ref={svgRef}
        viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <g className="tetra__edges">
          {EDGES.map((edge, index) => (
            <line
              key={`${edge[0]}-${edge[1]}`}
              className="tetra__edge"
              ref={(el) => {
                edgeRefs.current[index] = el
              }}
            />
          ))}
        </g>
        <circle className="tetra__centroid" cx={width / 2} cy={height / 2} r={2} />
        <circle className="tetra__reticle" ref={reticleRef} />
        <polyline className="tetra__leader" ref={leaderRef} />
        <g className="tetra__nodes">
          {CORNERS.map((corner, index) => (
            <circle
              key={corner.id}
              className="tetra__node"
              ref={(el) => {
                nodeRefs.current[index] = el
              }}
            />
          ))}
        </g>
      </svg>

      {/* Real DOM controls over a presentational SVG: SVG interactive elements
          have inconsistent assistive-technology support; buttons do not. */}
      <div
        className={compactLabels ? 'tetra__controls tetra__controls--chips' : 'tetra__controls'}
        role="tablist"
        aria-label="Materials tetrahedron corners"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {CORNERS.map((corner, index) => (
          <button
            key={corner.id}
            type="button"
            role="tab"
            id={`tetra-tab-${corner.id}`}
            className="tetra__corner"
            aria-selected={index === activeIndex}
            aria-controls={panelId}
            tabIndex={index === activeIndex ? 0 : -1}
            ref={(el) => {
              buttonRefs.current[index] = el
            }}
            onClick={() => onSelect(index, true)}
          >
            <span className="tetra__corner-text">{corner.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
