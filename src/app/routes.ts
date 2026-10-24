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
}

export const routes = [
  { path: '/', label: 'Home', component: HomePage },
  { path: '/materials', label: 'Materials', component: MaterialsPage },
  { path: '/definition', label: 'Definition', component: DefinitionPage },
  { path: '/relations', label: 'Relations', component: RelationsPage },
  { path: '/engineering', label: 'Engineering', component: EngineeringPage },
  { path: '/analysis', label: 'Analysis', component: AnalysisPage },
  { path: '/manual', label: 'Manual', component: ManualPage },
  { path: '/supports', label: 'Supports', component: SupportsPage },
] as const satisfies readonly Route[]

const notFound: Route = {
  path: '/404',
  label: 'Page not found',
  component: NotFoundPage,
}

export function resolveRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/$/, '') || '/'
  return routes.find((route) => route.path === path) ?? notFound
}
