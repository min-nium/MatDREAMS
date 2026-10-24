import { useEffect, useRef } from 'react'
import { Navigation } from '../components/ui/Navigation'
import { useHashRoute } from './useHashRoute'

export function App() {
  const route = useHashRoute()
  const previousPath = useRef(route.path)
  const main = useRef<HTMLElement>(null)
  const Page = route.component

  useEffect(() => {
    document.title = `${route.label} | MatDREAMS`

    if (previousPath.current !== route.path) {
      main.current?.focus()
      previousPath.current = route.path
    }
  }, [route.path, route.label])

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          main.current?.focus()
          main.current?.scrollIntoView()
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a className="site-name" href="#/">MatDREAMS</a>
        <p>Materials-science research website · Development scaffold</p>
        <Navigation currentPath={route.path} />
      </header>
      <main id="main-content" ref={main} tabIndex={-1}>
        <Page />
      </main>
      <footer className="site-footer">
        <p>Initial setup only. No public research graph is loaded.</p>
      </footer>
    </>
  )
}
