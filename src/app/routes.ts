import type { ComponentType } from 'react'
import { AnalysisPage } from '../pages/AnalysisPage'
import { DefinitionPage } from '../pages/DefinitionPage'
import { EngineeringPage } from '../pages/EngineeringPage'
import { HomePage } from '../pages/HomePage'
import { ManualPage } from '../pages/ManualPage'
import { MaterialsPage } from '../pages/MaterialsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RelationsPage } from '../pages/RelationsPage'
import { SupportsPage } from '../pages/SupportsPage'

interface Route {
  readonly path: string
  readonly label: string
  readonly component: ComponentType
  /**
   * How many leading characters of the label form the MatDREAMS acrostic.
   * Zero means the route is not one of the seven acrostic sections.
   *
   * Mat + D + R + E + A + M + S spells the product name, so the wordmark and
   * the section navigation are the same seven segments. This is presentation
   * data, deliberately kept beside the route rather than hard-coded in the
   * navigation component. It does not affect route resolution.
   */
  readonly acrostic: number
}

export const routes = [
  { path: '/', label: 'Home', component: HomePage, acrostic: 0 },
  { path: '/materials', label: 'Materials', component: MaterialsPage, acrostic: 3 },
  { path: '/definition', label: 'Definition', component: DefinitionPage, acrostic: 1 },
  { path: '/relations', label: 'Relations', component: RelationsPage, acrostic: 1 },
  { path: '/engineering', label: 'Engineering', component: EngineeringPage, acrostic: 1 },
  { path: '/analysis', label: 'Analysis', component: AnalysisPage, acrostic: 1 },
  { path: '/manual', label: 'Manual', component: ManualPage, acrostic: 1 },
  { path: '/supports', label: 'Supports', component: SupportsPage, acrostic: 1 },
] as const satisfies readonly Route[]

/** The seven acrostic sections, in wordmark order. Home is the wordmark itself. */
export const sections = routes.filter((route) => route.acrostic > 0)

/** `['Mat', 'D', 'R', 'E', 'A', 'M', 'S']` — the wordmark, derived from the routes. */
export const wordmarkSegments = sections.map((route) => route.label.slice(0, route.acrostic))

const notFound: Route = {
  path: '/404',
  label: 'Page not found',
  component: NotFoundPage,
  acrostic: 0,
}

export function resolveRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/$/, '') || '/'
  return routes.find((route) => route.path === path) ?? notFound
}
