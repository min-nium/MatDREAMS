import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ResearchMarkdown } from '../src/components/research/ResearchDocument'
import { documentMatches, safeResearchLink, splitResearchDocument } from '../src/components/research/researchMarkdown'
import { checkedAnalysis, supportDistribution } from '../src/components/research/researchAnalysis'
import type { ResearchAnalysisResponse } from '../src/components/research/researchAnalysis'
import { SupportsPage } from '../src/pages/SupportsPage'

describe('runtime research documentation', () => {
  it('keeps command headings inside fences and splits real sections', () => {
    const sections = splitResearchDocument('# Synthetic manual\n\nIntro\n\n## Environment\n\n```sh\n## this is a shell comment\nprintf example\n```\n\n## Verify\n\nChecks')
    expect(sections.map((section) => section.title)).toEqual(['Release and scope', 'Environment', 'Verify'])
    expect(sections[1]?.markdown).toContain('## this is a shell comment')
    expect(documentMatches(sections[1]!, 'shell')).toBe(true)
    expect(documentMatches(sections[1]!, 'no matching phrase')).toBe(false)
  })

  it('does not create executable or file links from source Markdown', () => {
    for (const value of ['javascript:alert(1)', 'file:///private-input', '../private.md', '/private', 'data:text/html,test']) expect(safeResearchLink(value)).toBeNull()
    expect(safeResearchLink('https://example.org/source')).toBe('https://example.org/source')
    const html = renderToStaticMarkup(<ResearchMarkdown markdown={'<script>alert(1)</script>\n\n[bad](javascript:bad) [source](https://example.org)'} />)
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('href="javascript:')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('href="https://example.org/"')
  })

  it('preserves command text and renders accessible source tables', () => {
    const html = renderToStaticMarkup(<ResearchMarkdown markdown={'```sh\nprintf "<example>"\n```\n\n| State | Count |\n|---|---:|\n| Synthetic | 2 |'} />)
    expect(html).toContain('printf &quot;&lt;example&gt;&quot;')
    expect(html).toContain('<th scope="col">State</th>')
    expect(html).toContain('<td>Synthetic</td>')
  })
})

describe('analysis source boundaries', () => {
  const synthetic = { summary: { release_id: 'synthetic', graph_sha256: 'test-sha', scopes: [{ id: 'all', paper_count: 2, relation_count: 1, node_count: 2, checkpoints: [], verdict: { status: 'not stable', candidate_minimum: null } }] }, normalization: {}, verification: { graph_sha256: 'test-sha' } } satisfies ResearchAnalysisResponse
  it('rejects another graph or missing complete analysis universe', () => {
    expect(checkedAnalysis(synthetic, 'test-sha', 'synthetic')).toBe(synthetic)
    expect(() => checkedAnalysis(synthetic, 'another-sha', 'synthetic')).toThrow('identity')
    expect(() => checkedAnalysis({ ...synthetic, verification: { graph_sha256: 'another-sha' } }, 'test-sha', 'synthetic')).toThrow('another graph')
    expect(() => checkedAnalysis({ ...synthetic, summary: { ...synthetic.summary, scopes: [] } }, 'test-sha', 'synthetic')).toThrow('identity')
  })

  it('counts unique paper-ID support, never repeated claim support', () => {
    expect(supportDistribution([{ paper_ids: ['synthetic-a', 'synthetic-a'] }, { paper_ids: ['synthetic-a', 'synthetic-b'] }, { paper_ids: ['synthetic-b'] }])).toEqual([[1, 2], [2, 1]])
  })
})

describe('external contribution guidance', () => {
  it('identifies external reporting without a false submission form or invented team', () => {
    const html = renderToStaticMarkup(<SupportsPage />)
    expect(html).toContain('https://github.com/min-nium/MatDREAMS/issues')
    expect(html).toContain('no submission backend')
    expect(html).toContain('have not been supplied')
    expect(html).not.toContain('<form')
  })
})
