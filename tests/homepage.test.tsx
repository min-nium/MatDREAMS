import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HomePage } from '../src/pages/HomePage'
import { MetricStrip } from '../src/components/ui/MetricStrip'
import { SystemRail } from '../src/components/ui/SystemRail'
import {
  CURRENT_PROVENANCE,
  metricCells,
  provenanceRows,
  shortDigest,
  statusText,
} from '../src/components/ui/provenance'
import type { ProvenanceState } from '../src/components/ui/provenance'
import { CORNERS } from '../src/components/graph/corners'

const home = renderToStaticMarkup(<HomePage />)

describe('homepage tetrahedron markup', () => {
  it('exposes the corners as a tab list with real buttons', () => {
    expect(home).toContain('role="tablist"')
    expect(home.match(/role="tab"/g)).toHaveLength(CORNERS.length)
    for (const corner of CORNERS) {
      expect(home).toContain(`id="tetra-tab-${corner.id}"`)
      expect(home).toContain(`>${corner.label}</span>`)
    }
  })

  it('selects exactly one corner and gives it the only tab stop', () => {
    expect(home.match(/aria-selected="true"/g)).toHaveLength(1)
    expect(home.match(/tabindex="0"/g)?.length).toBeGreaterThanOrEqual(1)
    expect(home.match(/aria-selected="false"/g)).toHaveLength(CORNERS.length - 1)
  })

  it('wires every corner to the explanation panel', () => {
    expect(home.match(/aria-controls="tetra-panel"/g)).toHaveLength(CORNERS.length)
    expect(home).toContain('role="tabpanel"')
    expect(home).toContain('id="tetra-panel"')
    expect(home).toContain('aria-labelledby="tetra-tab-')
  })

  it('hides the drawing from assistive technology and keeps the controls visible', () => {
    // The SVG is presentation; the buttons over it carry the interaction.
    expect(home).toContain('aria-hidden="true"')
    expect(home).toContain('<svg')
    expect(home).toContain('class="tetra__controls"')
  })

  it('offers visible, labelled pause controls for the continuous motion', () => {
    expect(home).toContain('Pause rotation')
    expect(home).toContain('Pause auto-advance')
    expect(home).toContain('aria-pressed="false"')
  })

  it('states the motion timings that were approved', () => {
    expect(home).toContain('4.5s each')
    expect(home).toContain('60s per revolution')
  })
})

describe('scientific integrity of the homepage', () => {
  it('shows the pending-review state rather than invented science', () => {
    expect(home).toContain('Explanation pending review')
    expect(home).toContain('Not yet supplied')
    // Rendered as a labelled status block, so it cannot be read as content.
    expect(home).toContain('class="pending"')
    expect(home).toContain('pending__label')
  })

  it('says plainly that the figure is not research data', () => {
    expect(home).toContain('Conceptual diagram')
    expect(home).toContain('No approved public export is loaded')
    expect(home).toContain('carries no release data')
  })

  it('never labels a field as validated or verified', () => {
    // Publication approval and scientific verification are separate, and the
    // only date the contract carries is an approval date. The page may still
    // say "not a claim of verified truth" in prose — that is the point — so
    // this checks the field labels, which is where a false claim would live.
    const labels = [
      ...provenanceRows(CURRENT_PROVENANCE).map((row) => row.term),
      ...metricCells(CURRENT_PROVENANCE).map((cell) => cell.label),
    ].map((label) => label.toLowerCase())

    for (const label of labels) {
      expect(label).not.toContain('validat')
      expect(label).not.toContain('verif')
      expect(label).not.toContain('confirm')
      expect(label).not.toContain('score')
      expect(label).not.toContain('quality')
    }
    expect(labels).toContain('approved on')
  })
})

describe('provenance view model', () => {
  it('reports the repository state: no approved export', () => {
    expect(CURRENT_PROVENANCE.kind).toBe('absent')
    expect(statusText(CURRENT_PROVENANCE)).toContain('No approved public export is loaded')
  })

  it('renders every provenance field as empty when nothing is loaded', () => {
    const rows = provenanceRows(CURRENT_PROVENANCE)
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.empty).toBe(true)
      expect(row.value).toBe('—')
    }
    expect(rows.map((row) => row.term)).toContain('Approved on')
    expect(rows.map((row) => row.term)).not.toContain('Validated on')
  })

  it('reports evidence as three counts, never as a score', () => {
    const loaded: ProvenanceState = {
      kind: 'loaded',
      system: 'RHEA',
      contractVersion: 'matdreams-web-graph-v0.1-draft',
      release: 'synthetic-release',
      mapper: 'synthetic-mapper',
      sourceContract: 'synthetic-contract',
      sourceGraphSha256: 'a'.repeat(64),
      approvalId: 'synthetic-approval',
      approvedOn: '2026-01-01',
      concepts: 3,
      nodes: 4,
      relations: 2,
      evidence: { reviewed: 1, unreviewed: 2, disputed: 1 },
    }

    const evidence = metricCells(loaded).find((cell) => cell.label === 'Evidence')
    expect(evidence?.value).toBe('1 / 2 / 1')
    expect(evidence?.value).not.toContain('%')
  })

  it('shortens a digest for display without losing it', () => {
    const sha = 'a'.repeat(8) + 'b'.repeat(48) + 'c'.repeat(8)
    const short = shortDigest(sha)
    expect(short).toBe(`${'a'.repeat(8)}…${'c'.repeat(8)}`)
    const row = provenanceRows({
      kind: 'loaded',
      system: 'RHEA',
      contractVersion: 'c',
      release: 'r',
      mapper: 'm',
      sourceContract: 'sc',
      sourceGraphSha256: sha,
      approvalId: 'a',
      approvedOn: '2026-01-01',
      concepts: 0,
      nodes: 0,
      relations: 0,
      evidence: { reviewed: 0, unreviewed: 0, disputed: 0 },
    }).find((r) => r.term === 'Source SHA')
    expect(row?.title).toBe(sha)
  })

  it('surfaces a rejection with its error code instead of substituting data', () => {
    const failed: ProvenanceState = {
      kind: 'failed',
      code: 'release-identity-mismatch',
      message: 'Synthetic test message.',
    }
    expect(statusText(failed)).toContain('release-identity-mismatch')
    expect(statusText(failed)).toContain('rejected')
    for (const cell of metricCells(failed)) expect(cell.empty).toBe(true)
  })
})

describe('shell components in the empty state', () => {
  it('renders the metric strip with no invented values', () => {
    const html = renderToStaticMarkup(<MetricStrip state={CURRENT_PROVENANCE} />)
    expect(html.match(/metric__value--empty/g)).toHaveLength(5)
    expect(html).toContain('Public graph release status')
  })

  it('renders the system selector as a radio group with one choice checked', () => {
    const html = renderToStaticMarkup(
      <SystemRail selected="RHEA" onSelect={() => {}} state={CURRENT_PROVENANCE} />,
    )
    expect(html).toContain('role="radiogroup"')
    expect(html.match(/role="radio"/g)).toHaveLength(2)
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1)
    expect(html).toContain('Ni Superalloy')
    expect(html).toContain('Choose your system')
  })
})

describe('status wording by context', () => {
  it('only mentions the tetrahedron where a tetrahedron is actually shown', () => {
    // The homepage puts the figure directly above its strip; no other page has
    // one, so the rail must not claim "the figure above".
    expect(statusText(CURRENT_PROVENANCE, 'home')).toContain('figure above')
    expect(statusText(CURRENT_PROVENANCE, 'rail')).not.toContain('figure above')
    expect(statusText(CURRENT_PROVENANCE, 'rail')).toContain('No approved public export')
  })

  it('reports a rejection identically wherever it is shown', () => {
    const failed: ProvenanceState = { kind: 'failed', code: 'export-digest-mismatch', message: 'x' }
    expect(statusText(failed, 'home')).toBe(statusText(failed, 'rail'))
  })
})
