import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Navigation } from '../src/components/ui/Navigation'
import { resolveRoute, routes } from '../src/app/routes'

describe('GitHub Pages hash routing', () => {
  it.each(['', '#', '#/', '/'])('opens Home for %j', (hash) => {
    expect(resolveRoute(hash).label).toBe('Home')
  })

  it.each(routes)('resolves and renders $label via a direct hash link', (route) => {
    const resolved = resolveRoute(`#${route.path}`)
    const Page = resolved.component
    const html = renderToStaticMarkup(<Page />)

    expect(resolved.label).toBe(route.label)
    expect(html).toContain(`<h1>${route.label}</h1>`)
    expect(html).toContain('Initialization placeholder')
  })

  it('accepts a trailing slash and rejects unknown paths', () => {
    expect(resolveRoute('#/materials/').label).toBe('Materials')
    expect(resolveRoute('#/unknown').label).toBe('Page not found')
  })

  it('keeps all navigation links within the hosting page and marks the current page', () => {
    const html = renderToStaticMarkup(<Navigation currentPath="/relations" />)

    for (const route of routes) {
      expect(html).toContain(`href="#${route.path}"`)
    }

    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toContain('href="#/relations" aria-current="page"')
  })
})
