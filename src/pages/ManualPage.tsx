import { useState } from 'react'
import { useResearch } from '../app/ResearchContext'
import { ResearchDocument } from '../components/research/ResearchDocument'
import { ResearchPage } from '../components/ui/ResearchPage'
import './ResearchContent.css'

const manuals = [
  { key: 'reproducibility', title: 'RHEA reproduction and extension guide', description: 'Environment, inputs, construction stages, exact commands, verification, release activation and troubleshooting.' },
  { key: 'method', title: 'System Chart construction method', description: 'Scientific representation, conservative identity, family support, projections and bounded scenario interpretation.' },
  { key: 'graph-status', title: 'Current graph audit', description: 'Active release identity, count reconciliation, cached inputs and known inconsistencies.' },
  { key: 'convergence', title: 'Convergence diagnostics', description: 'Registered stability results and separately identified exploratory diagnostics.' },
  { key: 'normalization', title: 'Normalization evaluation', description: 'Production baseline and the unpromoted experimental mapper, with source-review limitations.' },
  { key: 'validation', title: 'Scientific graph validation report', description: 'Source-text checks, engineering receipts and what remains scientifically unestablished.' },
] as const

export function ManualPage() {
  const { graph } = useResearch()
  const [selected, setSelected] = useState<string>('reproducibility')
  const manual = manuals.find((item) => item.key === selected) ?? manuals[0]
  return (
    <ResearchPage title="Manual">
      {graph && <div className="research-content">
        <p className="research-content__lead">Read the implemented RHEA workflow at its source.</p>
        <p>The documents below are served read-only from the local research checkout. They are not bundled with the public website. Download Markdown for the complete source, including code blocks and release-specific verification records.</p>
        <dl className="research-content__identity"><dt>Release</dt><dd>{graph.release.release_id}</dd><dt>Mapper</dt><dd>{graph.release.mapping_version}</dd><dt>Graph SHA-256</dt><dd><code>{graph.release.graph_sha256}</code></dd></dl>
        <aside className="research-warning research-content__section">
          <p>Reproduction requires the existing authorized cache and the documented environment. Use a new isolated output directory. The meeting interface never runs reproduction commands, changes frozen releases or installs research dependencies.</p>
          <p>Ni Superalloy has no validated integrated workflow here. Its manual remains pending.</p>
        </aside>
        <div className="research-content__manual-picker"><label>Authoritative document<select value={selected} onChange={(event) => setSelected(event.target.value)}>{manuals.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}</select></label><p className="research-content__caption">{manual.description}</p></div>
        <ResearchDocument key={manual.key} documentKey={manual.key} title={manual.title} />
        <section className="research-content__section"><h2>Using this guide</h2><ul className="research-content__bullets"><li>Start with required inputs and environment; the pipeline replays cached evidence without re-extracting literature.</li><li>Inspect the graph SHA, release ID and mapper together before interpreting any chart or figure.</li><li>Use the guide’s verification records to distinguish a historical successful run from checks executed for this demonstration.</li><li>For a missing input, hash mismatch or environment mismatch, use the source guide’s diagnostics. Do not change pins to suppress a failure.</li></ul></section>
      </div>}
    </ResearchPage>
  )
}
