import { useSyncExternalStore } from 'react'
import { resolveRoute } from './routes'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useHashRoute() {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )

  return resolveRoute(hash)
}
