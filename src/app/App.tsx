import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigation } from '../components/ui/Navigation'
import { SystemRail } from '../components/ui/SystemRail'
import { Wordmark } from '../components/ui/Wordmark'
import { CURRENT_PROVENANCE } from '../components/ui/provenance'
import type { MaterialSystem } from '../types/graph'
import { useHashRoute } from './useHashRoute'
import { ResearchProvider } from './ResearchContext'

export function App() {
  const route = useHashRoute()
  const previousPath = useRef(route.path)
  const main = useRef<HTMLElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const Page = route.component

  /**
   * The selected system scopes every page. It is selectable now because the
   * selector is part of the shell, but no system has an approved public export
   * in this repository — the provenance block says so explicitly.
   */
  const [system, setSystem] = useState<MaterialSystem>('RHEA')
  const [navOpen, setNavOpen] = useState(false)
  const [sheetPath, setSheetPath] = useState(route.path)

  // A hash change while the sheet is open closes it. Adjusting state during
  // render is React's supported pattern here and avoids a cascading effect.
  if (sheetPath !== route.path) {
    setSheetPath(route.path)
    setNavOpen(false)
  }

  useEffect(() => {
    document.title = `${route.label} | MatDREAMS`

    if (previousPath.current !== route.path) {
      main.current?.focus()
      previousPath.current = route.path
    }
  }, [route.path, route.label])

  const closeNav = useCallback(() => {
    setNavOpen(false)
    toggleRef.current?.focus()
  }, [])

  // The sheet traps focus while open and restores it on close.
  useEffect(() => {
    if (!navOpen) return

    const sheet = sheetRef.current
    sheet?.querySelector<HTMLElement>('a, button')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeNav()
        return
      }
      if (event.key !== 'Tab' || !sheet) return

      const focusable = sheet.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navOpen, closeNav])

  return (
    <ResearchProvider system={system}>
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
        <Wordmark tagline="Materials research knowledge platform" />

        <div className="nav-sheet-wrap">
          <Navigation currentPath={route.path} />
        </div>

        <button
          type="button"
          className="nav-toggle"
          ref={toggleRef}
          aria-expanded={navOpen}
          aria-controls="section-sheet"
          onClick={() => setNavOpen((open) => !open)}
        >
          {navOpen ? 'Close' : 'Sections'}
        </button>
      </header>

      <div className="nav-sheet" id="section-sheet" ref={sheetRef} hidden={!navOpen}>
        <div className="nav-sheet__head">
          <span className="label">Sections</span>
          <button type="button" className="control" onClick={closeNav}>
            Close
          </button>
        </div>
        <Navigation currentPath={route.path} variant="sheet" onNavigate={closeNav} />
      </div>

      <div className="app-body">
        <SystemRail selected={system} onSelect={setSystem} state={CURRENT_PROVENANCE} />
        <main className="site-main" id="main-content" ref={main} tabIndex={-1}>
          <Page />
        </main>
      </div>

      <footer className="site-footer">
        <p>
          MatDREAMS is in active development. The homepage tetrahedron is a conceptual diagram of
          the materials paradigm, not a result derived from research data.
        </p>
        <p className="label-sm">No public research graph is loaded</p>
      </footer>
    </ResearchProvider>
  )
}
