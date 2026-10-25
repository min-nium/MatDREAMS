import type { ReactNode } from 'react'
import { useResearch } from '../../app/ResearchContext'
import '../../styles/research.css'

export function ResearchPage({ title, children }: { title: string; children: ReactNode }) {
  const state = useResearch()
  return <section className="research-page">
    <h1>{title}</h1>
    {state.enabled && <aside className="research-demo-banner" role="note"><strong>LOCAL RESEARCH DEMO</strong> · Unapproved for public redistribution · Scientific review pending</aside>}
    {state.system !== 'RHEA' ? <div className="research-notice"><h2>Ni Superalloy — pending integration</h2><p>No validated Ni Superalloy dataset or manual is integrated. RHEA data is not displayed for this selection.</p></div>
      : !state.enabled ? <div className="research-notice"><h2>Research data is unavailable in public mode</h2><p>This section is ready for the local faculty demonstration. No approved public export is configured.</p><p>Run the explicit local research development command to access the private RHEA demonstration on this workstation.</p></div>
      : state.status === 'error' ? <div role="alert" className="research-notice"><h2>Local research connection failed</h2><p>{state.error}</p><button className="control" onClick={state.retry}>Retry local connection</button></div>
      : state.status !== 'ready' ? <p role="status">Verifying the frozen RHEA release and loading the complete search index…</p>
      : children}
  </section>
}
