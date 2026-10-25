import type { MaterialSystem } from '../../types/graph'

/**
 * Presentation state for the provenance block and the metric strip.
 *
 * This is a view model only. It deliberately does not import or wrap
 * `loadApprovedGraph` / `validatePublicGraph`: the loading and validation
 * boundary in `src/data/` is unchanged by this design work.
 *
 * `public/data/` is empty and no reviewed `ApprovedReleasePin` exists in this
 * repository, so the only reachable state today is `absent`. The `loaded` and
 * `failed` shapes are defined now so the empty state is a designed state rather
 * than a placeholder, and so wiring the real loader later is an additive change.
 *
 * Field names come from docs/WEB_DATA_CONTRACT.md. Nothing here is renamed,
 * scored, or derived beyond counting.
 */
export type ProvenanceState =
  | { readonly kind: 'absent' }
  | {
      readonly kind: 'failed'
      /** `GraphDataError.code` from src/data/validateGraph.ts. */
      readonly code: string
      readonly message: string
    }
  | {
      readonly kind: 'loaded'
      readonly system: MaterialSystem
      readonly contractVersion: string
      readonly release: string
      readonly mapper: string
      readonly sourceContract: string
      readonly sourceGraphSha256: string
      readonly approvalId: string
      readonly approvedOn: string
      readonly concepts: number
      readonly nodes: number
      readonly relations: number
      /** Counts, never a score: a proportion would imply a quality judgement. */
      readonly evidence: {
        readonly reviewed: number
        readonly unreviewed: number
        readonly disputed: number
      }
    }

/**
 * The state of this repository today. Publication approval is a separate,
 * explicit act; the absence of an approved export is not a failure to hide.
 */
export const CURRENT_PROVENANCE: ProvenanceState = { kind: 'absent' }

export const EMPTY_VALUE = '—'

/** Shortened digest for display. The full value stays available as a title. */
export function shortDigest(sha: string): string {
  return sha.length > 20 ? `${sha.slice(0, 8)}…${sha.slice(-8)}` : sha
}

export interface ProvenanceRow {
  readonly term: string
  readonly value: string
  readonly empty: boolean
  readonly title?: string
}

export function provenanceRows(state: ProvenanceState): readonly ProvenanceRow[] {
  if (state.kind !== 'loaded') {
    return [
      { term: 'Contract', value: EMPTY_VALUE, empty: true },
      { term: 'System', value: EMPTY_VALUE, empty: true },
      { term: 'Release', value: EMPTY_VALUE, empty: true },
      { term: 'Mapper', value: EMPTY_VALUE, empty: true },
      { term: 'Source SHA', value: EMPTY_VALUE, empty: true },
      { term: 'Approval ID', value: EMPTY_VALUE, empty: true },
      { term: 'Approved on', value: EMPTY_VALUE, empty: true },
    ]
  }

  return [
    { term: 'Contract', value: state.contractVersion, empty: false },
    { term: 'System', value: state.system, empty: false },
    { term: 'Release', value: state.release, empty: false },
    { term: 'Mapper', value: state.mapper, empty: false },
    {
      term: 'Source SHA',
      value: shortDigest(state.sourceGraphSha256),
      empty: false,
      title: state.sourceGraphSha256,
    },
    { term: 'Approval ID', value: state.approvalId, empty: false },
    // Labelled as approval, never as validation: publication approval and
    // scientific verification are separate, and the contract says so.
    { term: 'Approved on', value: state.approvedOn, empty: false },
  ]
}

export interface MetricCell {
  readonly label: string
  readonly value: string
  readonly empty: boolean
  readonly caption: string
}

export function metricCells(state: ProvenanceState): readonly MetricCell[] {
  if (state.kind !== 'loaded') {
    return [
      { label: 'System', value: EMPTY_VALUE, empty: true, caption: 'No system selected for an approved export.' },
      { label: 'Release', value: EMPTY_VALUE, empty: true, caption: 'Upstream release identifier.' },
      { label: 'Nodes', value: EMPTY_VALUE, empty: true, caption: 'Role nodes in the approved export.' },
      { label: 'Relations', value: EMPTY_VALUE, empty: true, caption: 'Relations in the approved export.' },
      {
        label: 'Evidence',
        value: EMPTY_VALUE,
        empty: true,
        caption: 'Counts of reviewed, unreviewed and disputed records.',
      },
    ]
  }

  return [
    { label: 'System', value: state.system, empty: false, caption: 'Material system of this export.' },
    { label: 'Release', value: state.release, empty: false, caption: 'Upstream release identifier.' },
    {
      label: 'Nodes',
      value: String(state.nodes),
      empty: false,
      caption: 'Role nodes in the approved export.',
    },
    {
      label: 'Relations',
      value: String(state.relations),
      empty: false,
      caption: 'Relations in the approved export.',
    },
    {
      label: 'Evidence',
      value: `${state.evidence.reviewed} / ${state.evidence.unreviewed} / ${state.evidence.disputed}`,
      empty: false,
      caption: 'Reviewed / unreviewed / disputed. Counts, not a score.',
    },
  ]
}

/**
 * Where the message is shown. The homepage sits a four-cornered scientific
 * diagram directly above its status strip, so there it must say explicitly
 * that the diagram is not from the release. Every other page has no such
 * figure, and claiming one would be wrong.
 */
export type StatusContext = 'rail' | 'home'

export function statusText(state: ProvenanceState, context: StatusContext = 'rail'): string {
  switch (state.kind) {
    case 'loaded':
      return 'An approved public export is loaded. Evidence review status is recorded per record and is not a claim of verified truth.'
    case 'failed':
      return `Public graph data was rejected (${state.code}). ${state.message}`
    case 'absent':
    default:
      return context === 'home'
        ? 'No approved public export is loaded. The figure above is the conceptual materials tetrahedron and carries no release data.'
        : 'No approved public export is loaded for this system.'
  }
}
