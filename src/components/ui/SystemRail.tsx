import { useState } from 'react'
import { provenanceRows, statusText } from './provenance'
import type { ProvenanceState } from './provenance'
import type { MaterialSystem } from '../../types/graph'

const SYSTEMS: readonly MaterialSystem[] = ['RHEA', 'Ni Superalloy']

interface SystemRailProps {
  selected: MaterialSystem
  onSelect: (system: MaterialSystem) => void
  state: ProvenanceState
}

/**
 * The persistent material-system selector and provenance block.
 *
 * Keeping this visible on every page states what the data on screen is about,
 * always — and states plainly when there is none.
 *
 * The provenance detail sits behind a disclosure at every width. Seven rows of
 * em-dashes is a lot of visual weight to spend saying "nothing is loaded", and
 * the summary line says the same thing in one. Nothing is removed: the full
 * field list, with its contract names, is one click away and is rendered in
 * the DOM either way.
 */
export function SystemRail({ selected, onSelect, state }: SystemRailProps) {
  const rows = provenanceRows(state)
  const [detailOpen, setDetailOpen] = useState(false)
  const summary =
    state.kind === 'loaded'
      ? state.release
      : state.kind === 'failed'
        ? 'Rejected'
        : 'No approved export'

  return (
    <aside className="rail" aria-label="Material system and data provenance">
      <div className="rail__block">
        <h2 className="label rail__heading" id="system-selector-label">
          Choose your system
        </h2>
        <div className="rail__systems" role="radiogroup" aria-labelledby="system-selector-label">
          {SYSTEMS.map((system) => {
            const checked = system === selected
            return (
              <button
                key={system}
                type="button"
                role="radio"
                className="rail__system"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => onSelect(system)}
              >
                <span className="rail__mark" aria-hidden="true" />
                <span>{system}</span>
              </button>
            )
          })}
        </div>
      </div>

      <hr className="rail__divider" />

      <div className="rail__block">
        <h2 className="label rail__heading">Data provenance</h2>
        <p className="rail__summary">
          <span className="rail__summary-mark" aria-hidden="true" />
          <span className="rail__summary-text">{summary}</span>
        </p>
        <button
          type="button"
          className="rail__disclosure"
          aria-expanded={detailOpen}
          aria-controls="provenance-detail"
          onClick={() => setDetailOpen((open) => !open)}
        >
          {detailOpen ? 'Hide fields' : 'All fields'}
        </button>

        <div className="rail__detail" id="provenance-detail" data-open={detailOpen}>
          <dl className="provenance">
            {rows.map((row) => (
              <div className="provenance__row" key={row.term}>
                <dt className="provenance__term">{row.term}</dt>
                <dd
                  className={
                    row.empty ? 'provenance__value provenance__value--empty' : 'provenance__value'
                  }
                  title={row.title}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="status-note">
            <span className="status-note__label">Status</span>
            {statusText(state)}
          </p>
        </div>
      </div>
    </aside>
  )
}
