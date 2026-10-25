import { sections } from '../../app/routes'

interface NavigationProps {
  currentPath: string
  /** Distinguishes the header bar from the mobile sheet for ARIA labelling. */
  variant?: 'bar' | 'sheet'
  onNavigate?: () => void
}

/**
 * The acrostic navigation.
 *
 * Each section is one word with its leading segment emphasised, so the word
 * stays readable while the acrostic stays visible. The current section is
 * marked by weight, an underline and colour together — never colour alone.
 */
export function Navigation({ currentPath, variant = 'bar', onNavigate }: NavigationProps) {
  return (
    <nav aria-label={variant === 'sheet' ? 'Sections (expanded)' : 'Sections'}>
      <ul className="acrostic">
        {sections.map((route) => {
          const initial = route.label.slice(0, route.acrostic)
          const rest = route.label.slice(route.acrostic)
          const current = currentPath === route.path
          return (
            <li key={route.path}>
              <a
                className="acrostic__link"
                href={`#${route.path}`}
                aria-current={current ? 'page' : undefined}
                onClick={onNavigate}
              >
                <span className="acrostic__initial">{initial}</span>
                <span className="acrostic__rest">{rest}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
