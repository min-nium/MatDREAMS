import { useEffect, useState } from 'react'
import { fetchResearch } from '../../data/researchClient'
import type { ResearchClaim, ResearchPaper } from '../../types/research'

export function PaperRecord({ paper }: { paper: ResearchPaper }) {
  const doi = paper.doi_url || (paper.doi ? `https://doi.org/${paper.doi}` : null)
  const confirmed = paper.publication_identity?.source_confirmed_primary === true
  return <article><h3>{paper.title || 'Title unavailable'}</h3><p><code>{paper.paper_id}</code> · Provisional paper identifier</p>
    <p>Article identity: {confirmed ? 'Source-confirmed primary record' : 'Not independently confirmed'}. DOI resolution alone does not verify extraction.</p>
    {doi && /^https:\/\/doi\.org\//i.test(doi) && <a href={doi} target="_blank" rel="noreferrer">{confirmed ? 'Open source-confirmed DOI' : 'Open asserted DOI · unverified'}</a>}
  </article>
}

export function ResearchEvidence({ familyId }: { familyId: string }) {
  const [payload, setPayload] = useState<{ claims: ResearchClaim[]; papers: ResearchPaper[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    void fetchResearch<{ claims: ResearchClaim[]; papers: ResearchPaper[] }>(`family/${encodeURIComponent(familyId)}`).then((data) => { if (active) setPayload(data) }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Evidence unavailable') })
    return () => { active = false }
  }, [familyId])
  if (error) return <p role="alert">{error}</p>
  if (!payload) return <p role="status">Loading original local evidence…</p>
  return <div><h3>Original claims ({payload.claims.length})</h3>
    <p className="research-warning">Local-only evidence. Human scientific acceptance pending. Adjacency does not establish compatible materials, conditions, or causal mediation.</p>
    {payload.claims.map((claim) => <details key={claim.claim_id}><summary>{claim.source_original} {claim.directed ? '→' : '—'} {claim.target_original}</summary>
      <p><code>{claim.claim_id}</code> · <code>{claim.paper_id}</code></p><p>{claim.relation_type} · {claim.directed ? 'Directed as reported' : 'Undirected'} · {claim.polarity} · Review: {claim.review_status || 'Unknown'}</p>
      <h4>Reported conditions</h4><pre>{JSON.stringify(claim.conditions ?? 'Unavailable; not inferred', null, 2)}</pre>
      <h4>Original context</h4><pre>{JSON.stringify(claim.context ?? 'Unavailable; not inferred', null, 2)}</pre>
      <h4>Local evidence and locators</h4>{claim.evidence?.length ? <pre>{JSON.stringify(claim.evidence, null, 2)}</pre> : <p>Quotation/context unavailable; no source text inferred.</p>}
      <pre>{JSON.stringify(claim.evidence_locator ?? 'Page/figure locator unavailable', null, 2)}</pre>
    </details>)}
    <h3>Supporting papers ({payload.papers.length})</h3>{payload.papers.map((paper) => <details key={paper.paper_id}><summary>{paper.title || paper.paper_id}</summary><PaperRecord paper={paper} /></details>)}
  </div>
}
