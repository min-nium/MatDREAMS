import { useResearch } from '../app/ResearchContext'
import { ResearchDocument } from '../components/research/ResearchDocument'
import { ResearchPage } from '../components/ui/ResearchPage'
import './ResearchContent.css'

const stages = [
  ['Collect', 'Freeze the supplied literature records and source cache; keep inclusion, exclusion and duplicate decisions explicit.'],
  ['Extract', 'Reuse the selected source claims with their original terms, direction, polarity, conditions and evidence. No new extraction runs in the website.'],
  ['Normalize', 'Use the frozen, conservative concept mapping. Similar spelling alone does not establish the same physical quantity.'],
  ['Construct', 'Keep concept identity distinct from its chart role. Group claims into typed, directed and signed relation families without dropping the individual claims.'],
  ['Project', 'Present concepts in an integrated chart, while retaining the underlying role nodes and original relation-family IDs.'],
  ['Evaluate', 'Measure structural accumulation on the complete fixed graph, separately from the small visual overview and scientific review.'],
] as const

export function MaterialsPage() {
  const { graph } = useResearch()
  return (
    <ResearchPage title="Materials">
      {graph && <div className="research-content">
        <p className="research-content__lead">A source-linked System Chart for learning concepts, inspecting relationships and asking better materials questions.</p>
        <section className="research-content__section">
          <span className="label">The materials paradigm, made inspectable</span>
          <h2>Processing → Intermediate State → Property → Performance</h2>
          <p>The traditional materials paradigm connects processing, structure, properties and performance. The System Chart uses source-specific intermediate states and preserves direct, same-layer and testing-condition relations when they occur in the selected evidence. It does not invent an intermediate step to fill a column.</p>
          <p>A chart is a projection of an evidence graph. Each relation must remain connected to its original claim and supporting source; a connected path alone is not a validated processing recipe.</p>
        </section>
        <section className="research-content__section">
          <h2>The current RHEA pilot</h2>
          <p>The research program is CCA-wide; the quantitative pilot concerns RHEA room-temperature tensile yield–ductility evidence. This larger descriptive chart also retains other explicitly in-scope RHEA or mixed claims. No strength–ductility pass threshold or service qualification is implied.</p>
          <dl className="research-content__metrics">
            <div><dt>Selected provisional paper IDs</dt><dd>{graph.papers.length.toLocaleString('en')}</dd></div>
            <div><dt>Selected claims</dt><dd>{graph.claims.length.toLocaleString('en')}</dd></div>
            <div><dt>Canonical concepts</dt><dd>{graph.concepts.length.toLocaleString('en')}</dd></div>
            <div><dt>Role nodes</dt><dd>{graph.views.evidence_full?.nodes.length.toLocaleString('en') ?? 'Unavailable'}</dd></div>
            <div><dt>Relation families</dt><dd>{graph.views.evidence_full?.relations.length.toLocaleString('en') ?? 'Unavailable'}</dd></div>
          </dl>
          <p className="research-content__caption">Release <code>{graph.release.release_id}</code> · mapper <code>{graph.release.mapping_version}</code>. Paper identifiers remain provisional; their count is not an independently verified study count.</p>
        </section>
        <section className="research-content__section">
          <h2>How the chart is constructed</h2>
          <ol className="research-content__process">{stages.map(([title, text], index) => <li key={title}><span className="label">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
        </section>
        <section className="research-content__section research-warning">
          <h2>What the graph does not establish</h2>
          <p>The supplied extraction is bounded. This chart does not exhaustively capture every finding in the literature. Source-text consistency, publication identity, scientific truth, compatible specimen transfers and public redistribution permission are separate questions.</p>
          <p>Unresolved concepts retain their identities. Opposite signs, null results and different measurement conditions are preserved. No verified quantitative physical model or compatible engineering route follows from topology alone.</p>
        </section>
        <nav className="research-content__destinations" aria-label="Continue exploring Materials">
          <a href="#/relations"><strong>Relations</strong><span>Explore the complete graph index and source evidence.</span></a>
          <a href="#/definition"><strong>Definition</strong><span>Inspect concept identities and available terminology records.</span></a>
          <a href="#/analysis"><strong>Analysis</strong><span>Read the registered structural result and its limits.</span></a>
          <a href="#/manual"><strong>Manual</strong><span>Inspect authoritative reproduction procedures.</span></a>
        </nav>
        <ResearchDocument documentKey="method" title="Authoritative construction method" />
      </div>}
    </ResearchPage>
  )
}
