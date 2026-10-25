import { metricCells, statusText } from './provenance'
import type { ProvenanceState } from './provenance'

interface MetricStripProps {
  state: ProvenanceState
}

/**
 * Hairline-divided metric cells. No cards, no radius, no shadow — the rules
 * alone create the structure.
 *
 * There is deliberately no "validated" cell. The only date the contract carries
 * is `publication.approvedOn`, which is an approval date; labelling it
 * "validated" would conflate publication approval with scientific verification.
 */
export function MetricStrip({ state }: MetricStripProps) {
  const cells = metricCells(state)

  return (
    <section className="metric-strip" aria-label="Public graph release status">
      <div className="metric-strip__cells" style={{ ['--metric-cols' as string]: cells.length }}>
        {cells.map((cell) => (
          <div className="metric" key={cell.label}>
            <span className="label-sm metric__label">{cell.label}</span>
            <p className={cell.empty ? 'metric__value metric__value--empty' : 'metric__value'}>
              {cell.value}
            </p>
            <p className="metric__caption">{cell.caption}</p>
          </div>
        ))}
      </div>
      <div className="metric-strip__status">
        <span className="label-sm">Status</span>
        <p className="metric-strip__status-text">{statusText(state, 'home')}</p>
      </div>
    </section>
  )
}
