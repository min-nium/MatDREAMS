import { useEffect, useState } from 'react'
import { useResearch } from '../app/ResearchContext'
import { ResearchDocument } from '../components/research/ResearchDocument'
import { aggregateNumber, checkedAnalysis, supportDistribution } from '../components/research/researchAnalysis'
import type { ResearchAnalysisResponse } from '../components/research/researchAnalysis'
import { ResearchPage } from '../components/ui/ResearchPage'
import { fetchResearch, researchFigureUrl } from '../data/researchClient'
import './ResearchContent.css'

const figures = [
  { key: 'convergence-main', title: 'Registered full-graph convergence', caption: 'Saved production analysis under the fixed corpus, vocabulary and original stability criterion. Bands describe within-corpus subset variation, not scientific accuracy.' },
  { key: 'convergence-strata', title: 'Available subgroup analysis', caption: 'Saved production figure. Insufficient structured metadata limits subgroup interpretation; no subgroup has been inferred from titles or graph proximity.' },
  { key: 'normalization', title: 'Production normalization revision', caption: 'Saved production v3→v4 normalization comparison, not the experimental v6 candidate.' },
] as const
const reports = [
  { key: 'convergence', title: 'Registered and exploratory convergence diagnostics' },
  { key: 'normalization', title: 'Normalization evaluation and experimental boundary' },
  { key: 'validation', title: 'Source-consistency and scientific-review report' },
] as const

function percent(value: number) { return `${(100 * value).toFixed(1)}%` }

export function AnalysisPage() {
  const { graph, enabled, status, system } = useResearch()
  const [loaded, setLoaded] = useState<ResearchAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [figureKey, setFigureKey] = useState<string>('convergence-main')
  const [reportKey, setReportKey] = useState<string>('convergence')
  useEffect(() => {
    if (!graph || !enabled || status !== 'ready' || system !== 'RHEA') return
    let active = true
    void fetchResearch<ResearchAnalysisResponse>('analysis').then((value) => checkedAnalysis(value, graph.release.graph_sha256, graph.release.release_id)).then((value) => { if (active) { setLoaded(value); setError(null) } }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Analysis could not be loaded.') })
    return () => { active = false }
  }, [graph, enabled, status, system, attempt])
  const scope = loaded?.summary.scopes.find((item) => item.id === 'all')
  const checkpoint = scope?.checkpoints.find((item) => item.n_papers === 1405)
  const evidence = graph?.views.evidence_full
  const support = evidence ? supportDistribution(evidence.relations) : []
  const figure = figures.find((item) => item.key === figureKey) ?? figures[0]
  const report = reports.find((item) => item.key === reportKey) ?? reports[0]
  const normalization = graph?.normalization_audit
  const audit = graph?.audit
  return (
    <ResearchPage title="Analysis">
      {graph && <div className="research-content">
        <p className="research-content__lead">Measure structural accumulation. Keep scientific validity a separate question.</p>
        <p className="research-content__caption">Production release <code>{graph.release.release_id}</code> · <code>{graph.release.mapping_version}</code>. Experimental v6 is not promoted or used for this chart.</p>
        <section className="research-content__section"><h2>Corpus inclusion and graph size</h2><dl className="research-content__metrics">
          <div><dt>Physical supplied records</dt><dd>{aggregateNumber(audit, 'physical_input_records')}</dd></div>
          <div><dt>Supplied identifier groups</dt><dd>{aggregateNumber(audit, 'publication_identifier_groups')}</dd></div>
          <div><dt>Selected provisional paper IDs</dt><dd>{graph.papers.length.toLocaleString('en')}</dd></div>
          <div><dt>Selected claims</dt><dd>{graph.claims.length.toLocaleString('en')}</dd></div>
          <div><dt>Canonical concepts</dt><dd>{graph.concepts.length.toLocaleString('en')}</dd></div>
          <div><dt>Role nodes / relation families</dt><dd>{evidence?.nodes.length.toLocaleString('en')} / {evidence?.relations.length.toLocaleString('en')}</dd></div>
        </dl><p>Bibliographic registration, extraction availability, selected claims and independent study identity are different states. A zero-selected record is not evidence of no physical effect or failed extraction.</p></section>
        <section className="research-content__section"><h2>Relation support distribution</h2><p>Support counts distinct provisional paper IDs per family, not quotations, claim repetitions or independently established replications.</p><div className="research-document__table"><table><thead><tr><th scope="col">Paper-ID support</th><th scope="col">Relation families</th></tr></thead><tbody>{support.map(([count, families]) => <tr key={count}><th scope="row">{count}</th><td>{families.toLocaleString('en')}</td></tr>)}</tbody></table></div></section>
        <section className="research-content__section"><h2>Registered structural result</h2>
          {error ? <div role="alert"><p>{error}</p><button className="control" type="button" onClick={() => setAttempt((value) => value + 1)}>Retry analysis</button></div> : !scope ? <p role="status">Loading release-bound analysis…</p> : <>
            <div className="research-content__verdict"><span className="label">Registered verdict</span><strong>{scope.verdict.status}</strong><p>Adequate minimum sample: {scope.verdict.candidate_minimum === null ? 'not established' : scope.verdict.candidate_minimum.toLocaleString('en')}</p></div>
            {checkpoint && <dl className="research-content__metrics"><div><dt>Joint passes at 1,405 IDs</dt><dd>{Math.round(checkpoint.criterion_success_fraction * 100)} / 100</dd></div><div><dt>Median family coverage</dt><dd>{percent(checkpoint.relation_coverage.median)}</dd></div><div><dt>Median top-10 / 20 / 50 retention</dt><dd>{percent(checkpoint.core_retention_10.median)} / {percent(checkpoint.core_retention_20.median)} / {percent(checkpoint.core_retention_50.median)}</dd></div></dl>}
            <p>The frozen criterion requires coverage and each top-10/20/50 retention ≥0.90, joint passing in ≥90 of 100 repetitions, and three consecutive passing nonterminal checkpoints. The guaranteed full-corpus endpoint cannot establish early stability.</p>
            <div className="research-document__table" tabIndex={0} role="region" aria-label="Registered convergence checkpoint results"><table><thead><tr><th scope="col">Selected IDs</th><th scope="col">Coverage median</th><th scope="col">Top-10</th><th scope="col">Top-20</th><th scope="col">Top-50</th><th scope="col">Joint passes / 100</th></tr></thead><tbody>{scope.checkpoints.map((point) => <tr key={point.n_papers}><th scope="row">{point.n_papers.toLocaleString('en')}{point.n_papers === scope.paper_count ? ' (terminal)' : ''}</th><td>{percent(point.relation_coverage.median)}</td><td>{percent(point.core_retention_10.median)}</td><td>{percent(point.core_retention_20.median)}</td><td>{percent(point.core_retention_50.median)}</td><td>{Math.round(point.criterion_success_fraction * 100)}</td></tr>)}</tbody></table></div>
          </>}
          <p className="research-warning">Convergence is not a scientific accuracy score, source-coverage estimate or proof of literature saturation. Exploratory tie orders and alternative graph definitions do not replace the registered result.</p>
        </section>
        <section className="research-content__section"><h2>Existing release figures</h2><label>Saved scientific figure<select value={figureKey} onChange={(event) => setFigureKey(event.target.value)}>{figures.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}</select></label><figure className="research-content__figure"><a href={researchFigureUrl(figure.key)} target="_blank" rel="noreferrer" aria-label={`Open full-size ${figure.title}`}><img src={researchFigureUrl(figure.key)} alt={figure.title} loading="lazy" /></a><figcaption>{figure.caption} Select the image to open its full size.</figcaption></figure></section>
        <section className="research-content__section"><h2>Normalization and review</h2><dl className="research-content__metrics"><div><dt>Active mentions</dt><dd>{aggregateNumber(normalization, 'active_mentions')}</dd></div><div><dt>Original expressions</dt><dd>{aggregateNumber(normalization, 'raw_expressions')}</dd></div><div><dt>Unresolved mentions</dt><dd>{aggregateNumber(normalization, 'unresolved_mentions')}</dd></div><div><dt>Human-accepted new mappings</dt><dd>{aggregateNumber(audit, 'human_accepted_new_mappings')}</dd></div></dl><p>Identity rules preserve physical meaning, loading, estimator, population and phase qualifiers. Unresolved occurrences are retained; they are not an independently measured error count. Production normalization and the separately reported experimental candidate must not be conflated.</p></section>
        <section className="research-content__section"><h2>What verification establishes</h2><div className="research-content__columns"><div><h3>Engineering and source consistency</h3><p>Saved source/structure verification status: <strong>{loaded?.verification.status ?? 'loading'}</strong>. Structural checks, hash comparisons and cached-text span checks establish reproducible internal consistency.</p><p>Cached selected-claim quote checks: {aggregateNumber(audit, 'source_quote_checks')}; recorded failures: {aggregateNumber(audit, 'source_quote_failures')}. These are saved research results, separate from the website’s current test suite.</p></div><div><h3>Scientific validity remains unestablished</h3><p>Human scientific acceptance, exhaustive extraction recall, original PDF fidelity, independent study identity, cross-study compatibility and transfer to another materials system require separate review.</p><p>Structured claim conditions remain incomplete. Free-text context and source review cannot be replaced with graph proximity or family support.</p></div></div></section>
        <section className="research-content__section"><label>Read the underlying report<select value={reportKey} onChange={(event) => setReportKey(event.target.value)}>{reports.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}</select></label><ResearchDocument key={report.key} documentKey={report.key} title={report.title} /></section>
      </div>}
    </ResearchPage>
  )
}
