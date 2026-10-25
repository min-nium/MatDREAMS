import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Navigation } from '../src/components/ui/Navigation'
import { Wordmark } from '../src/components/ui/Wordmark'
import { resolveRoute, routes, sections, wordmarkSegments } from '../src/app/routes'

describe('GitHub Pages hash routing', () => {
  it.each(['', '#', '#/', '/'])('opens Home for %j', (hash) => {
    expect(resolveRoute(hash).label).toBe('Home')
  })

  it('still resolves all eight routes by direct hash link', () => {
    expect(routes).toHaveLength(8)
    for (const route of routes) {
      expect(resolveRoute(`#${route.path}`).label).toBe(route.label)
    }
  })

  it.each(sections)('renders the $label section with a semantic heading', (route) => {
    const Page = route.component
    const html = renderToStaticMarkup(<Page />)

    expect(html).toContain(`>${route.label}</h1>`)
  })

  it('accepts a trailing slash and rejects unknown paths', () => {
    expect(resolveRoute('#/materials/').label).toBe('Materials')
    expect(resolveRoute('#/unknown').label).toBe('Page not found')
  })
})

describe('MatDREAMS acrostic', () => {
  it('spells the product name from its own section labels', () => {
    expect(wordmarkSegments).toEqual(['Mat', 'D', 'R', 'E', 'A', 'M', 'S'])
    expect(wordmarkSegments.join('')).toBe('MatDREAMS')
  })

  it('splits each section label without losing or duplicating a character', () => {
    for (const route of sections) {
      const initial = route.label.slice(0, route.acrostic)
      const rest = route.label.slice(route.acrostic)
      expect(initial + rest).toBe(route.label)
      expect(initial).not.toBe('')
    }
  })

  it('renders the wordmark as a Home link built from those segments', () => {
    const html = renderToStaticMarkup(<Wordmark tagline="Test tagline" />)
    expect(html).toContain('href="#/"')
    expect(html).toContain('aria-label="MatDREAMS — home"')
    for (const segment of wordmarkSegments) {
      expect(html).toContain(`>${segment}</span>`)
    }
  })
})

describe('section navigation', () => {
  const html = renderToStaticMarkup(<Navigation currentPath="/relations" />)

  it('links every section within the hosting page', () => {
    for (const route of sections) {
      expect(html).toContain(`href="#${route.path}"`)
    }
  })

  it('leaves Home to the wordmark rather than repeating it', () => {
    expect(sections.some((route) => route.path === '/')).toBe(false)
    expect(html).not.toContain('href="#/"')
  })

  it('marks exactly one current page', () => {
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toContain('href="#/relations" aria-current="page"')
  })

  it('emphasises the acrostic initial separately from the rest of the word', () => {
    expect(html).toContain('<span class="acrostic__initial">Mat</span>')
    expect(html).toContain('<span class="acrostic__rest">erials</span>')
    expect(html).toContain('<span class="acrostic__initial">R</span>')
    expect(html).toContain('<span class="acrostic__rest">elations</span>')
  })
})
