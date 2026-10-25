import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as publicPages from '../src/pages/PublicPages'

describe('public presentation without a scientific release', () => {
  it.each(['Materials', 'Definition', 'Relations', 'Engineering', 'Analysis', 'Manual'] as const)('provides truthful %s content without data controls', title => {
    const Page = publicPages[`${title}Page`]
    const html = renderToStaticMarkup(<Page />)
    expect(html).toContain(`>${title}</h1>`)
    expect(html).toContain('Public preview · research data unavailable')
    expect(html).not.toContain('LOCAL RESEARCH DEMO')
    expect(html).not.toContain('<input')
    expect(html).not.toContain('<svg')
    expect(html).not.toMatch(/__matdreams_local__|concept_[a-f0-9]+|rel_[a-f0-9]+|\/home\/|127\.0\.0\.1/)
  })

  it('separates technical checks, scientific review and publication approval', () => {
    const html = renderToStaticMarkup(<publicPages.AnalysisPage />)
    expect(html).toContain('Scientific validation remains separate')
    expect(html).toContain('Successful software checks do not grant permission')
    expect(html).toContain('summary statistics and source documents are withheld')
  })
})
