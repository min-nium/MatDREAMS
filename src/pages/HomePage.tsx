import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion, useMediaQuery } from '../app/useMediaQuery'
import { CornerPanel } from '../components/graph/CornerPanel'
import { Tetrahedron } from '../components/graph/Tetrahedron'
import { CORNERS, CYCLE_ORDER } from '../components/graph/corners'
import { DWELL_MS } from '../components/graph/projection'
import { MetricStrip } from '../components/ui/MetricStrip'
import { CURRENT_PROVENANCE } from '../components/ui/provenance'

const PANEL_ID = 'tetra-panel'

export function HomePage() {
  const reducedMotion = usePrefersReducedMotion()
  const stacked = useMediaQuery('(max-width: 900px)')
  const compactLabels = useMediaQuery('(max-width: 640px)')
  const orientation = stacked ? 'vertical' : 'horizontal'

  const [activeIndex, setActiveIndex] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [rotating, setRotating] = useState(true)
  const [dockOffset, setDockOffset] = useState(88)

  const panelRef = useRef<HTMLElement>(null)
  const dockRef = useRef<HTMLElement>(null)

  // Manual selection stops automatic cycling until the user resumes it.
  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index)
    setAutoAdvance(false)
  }, [])

  // Auto-advance never starts under reduced motion.
  useEffect(() => {
    if (!autoAdvance || reducedMotion) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const position = CYCLE_ORDER.indexOf(current)
        const next = CYCLE_ORDER[(position + 1) % CYCLE_ORDER.length]
        return next ?? 0
      })
    }, DWELL_MS)

    return () => window.clearInterval(timer)
  }, [autoAdvance, reducedMotion])

  // Escape resumes automatic cycling, as specified in the homepage spec.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !reducedMotion) setAutoAdvance(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [reducedMotion])

  const handleDockMeasured = useCallback((offset: number) => {
    setDockOffset((current) => (Math.abs(current - offset) > 0.5 ? offset : current))
  }, [])

  const controls = (
      <div className="figure-controls">
        <button
          type="button"
          className="control"
          aria-pressed={!rotating}
          disabled={reducedMotion}
          onClick={() => setRotating((value) => !value)}
        >
          <span className="control__dot" aria-hidden="true" />
          {reducedMotion ? 'Rotation off' : rotating ? 'Pause rotation' : 'Resume rotation'}
        </button>

        <button
          type="button"
          className="control"
          aria-pressed={!autoAdvance}
          disabled={reducedMotion}
          onClick={() => setAutoAdvance((value) => !value)}
        >
          <span className="control__dot" aria-hidden="true" />
          {reducedMotion
            ? 'Auto-advance off'
            : autoAdvance
              ? 'Pause auto-advance'
              : 'Resume auto-advance'}
        </button>

        <span className="control-note">
          {reducedMotion
            ? 'Reduced motion — figure is still'
            : `${CORNERS.length} corners · ${DWELL_MS / 1000}s each · 60s per revolution`}
        </span>
      </div>
  )

  return (
    <div className="home">
      <div className="home__stage">
        <section className="home__figure" aria-labelledby="home-title">
          <div className="home__eyebrow">
            <span className="label">The materials paradigm</span>
            <span className="label-sm">Conceptual diagram — not research data</span>
          </div>
          <h1 className="home__title" id="home-title">
            Processing, structure, property, performance.
          </h1>
          <p className="home__subtitle">
            MatDREAMS organises materials-science terminology and the evidence connecting it, one
            material system at a time. Select a corner of the framework to read it.
          </p>

          <Tetrahedron
            activeIndex={activeIndex}
            onSelect={handleSelect}
            rotating={rotating}
            reducedMotion={reducedMotion}
            orientation={orientation}
            dockRef={dockRef}
            panelRef={panelRef}
            onDockMeasured={handleDockMeasured}
            panelId={PANEL_ID}
            compactLabels={compactLabels}
          />

        </section>

        <div className="home__aside">
          <CornerPanel
            activeIndex={activeIndex}
            panelId={PANEL_ID}
            panelRef={panelRef}
            dockRef={dockRef}
            dockOffset={dockOffset}
            orientation={orientation}
          />
          {controls}
        </div>
      </div>

      <MetricStrip state={CURRENT_PROVENANCE} />

      <section className="orientation" aria-labelledby="orientation-title">
        <h2 className="label" id="orientation-title">
          How to use MatDREAMS
        </h2>
        <div className="orientation__grid">
          <article className="orientation__item">
            <span className="label-sm">01 — Terminology</span>
            <h3>Definitions before relations</h3>
            <p>
              Definition collects materials-science terminology with textbook definitions and
              research usage. Terms are categorised so a concept can be studied before it is
              traced through the graph.
            </p>
          </article>
          <article className="orientation__item">
            <span className="label-sm">02 — Evidence</span>
            <h3>Relations carry their evidence</h3>
            <p>
              Relations presents the graph for a selected system. Every node and relation records
              its evidence review status. Reviewed is not a claim of verified truth, and the
              interface never presents it as one.
            </p>
          </article>
          <article className="orientation__item">
            <span className="label-sm">03 — Exploration</span>
            <h3>Scenarios, not predictions</h3>
            <p>
              Engineering lets you select, remove, add, strengthen or weaken elements of the graph
              to explore how a change propagates. It does not produce a validated numerical
              prediction, because no quantitative model backs one.
            </p>
          </article>
          <article className="orientation__item">
            <span className="label-sm">04 — Reliability</span>
            <h3>Convergence stated plainly</h3>
            <p>
              Analysis reports how the graph behaves as its construction parameters change, so the
              reliability of what you are reading is visible rather than assumed.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
