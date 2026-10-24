import { routes } from '../../app/routes'

interface NavigationProps {
  currentPath: string
}

export function Navigation({ currentPath }: NavigationProps) {
  return (
    <nav aria-label="Main navigation">
      <ul className="navigation">
        {routes.map((route) => (
          <li key={route.path}>
            <a href={`#${route.path}`} aria-current={currentPath === route.path ? 'page' : undefined}>
              {route.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
