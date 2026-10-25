import type { RefObject } from 'react'
import { CORNERS, cornerAt } from './corners'

interface CornerPanelProps {
  activeIndex: number
  panelId: string
  panelRef: RefObject<HTMLElement | null>
  dockRef: RefObject<HTMLElement | null>
  /** Distance from the panel's leading edge to the dock point, in pixels. */
  dockOffset: number
  orientation: 'horizontal' | 'vertical'
}

export function CornerPanel({
  activeIndex,
  panelId,
  panelRef,
  dockRef,
  dockOffset,
  orientation,
}: CornerPanelProps) {
  const corner = cornerAt(activeIndex)
  const position = `Corner ${activeIndex + 1} of ${CORNERS.length}`

  const anchorStyle =
    orientation === 'vertical' ? { left: `${dockOffset}px`, top: '-1px' } : { top: `${dockOffset}px` }

  return (
    <section
      className="corner-panel"
      id={panelId}
      role="tabpanel"
      aria-labelledby={`tetra-tab-${corner.id}`}
      ref={panelRef as RefObject<HTMLElement>}
      tabIndex={0}
    >
      <span className="corner-panel__anchor" style={anchorStyle} aria-hidden="true" />

      {/*
        Keying on the corner id remounts this subtree, replaying the CSS
        entrance animation. No timers and no transient state, so there is
        nothing to leak and nothing to get stuck mid-transition. Reduced motion
        collapses the animation through the global media query.
      */}
      <div className="corner-panel__fade" key={corner.id}>
        <p className="label corner-panel__eyebrow">
          {position} · The materials paradigm
        </p>
        <hr className="corner-panel__rule" />
        <h2 className="corner-panel__title" ref={dockRef as RefObject<HTMLHeadingElement>}>
          {corner.label}
        </h2>

        {corner.explanation ? (
          <>
            <p className="corner-panel__body">{corner.explanation.definition}</p>
            <p className="label">Example</p>
            <p className="corner-panel__example">{corner.explanation.example}</p>
          </>
        ) : (
          <>
            {/*
              Pending-review state, rendered as a status block rather than as
              prose. Scientific content is supplied by the research team;
              inventing a definition here would present unreviewed text as
              reviewed fact, and setting the placeholder like body copy would
              let it be mistaken for one.
            */}
            <div className="pending">
              <p className="label-sm pending__label">Explanation pending review</p>
              <p className="pending__body">
                This corner is one of the four elements of the materials paradigm. Its definition
                and worked example are supplied by the research team and have not yet been approved
                for publication.
              </p>
            </div>
          </>
        )}

        <hr className="corner-panel__dashed" />
        <dl className="corner-panel__meta">
          <dt className="provenance__term">Position</dt>
          <dd className="provenance__value">{position}</dd>
          <dt className="provenance__term">Source</dt>
          <dd className="provenance__value provenance__value--empty">
            {corner.explanation ? corner.explanation.source : 'Not yet supplied'}
          </dd>
        </dl>
      </div>
    </section>
  )
}
