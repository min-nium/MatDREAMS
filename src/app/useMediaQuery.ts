import { useSyncExternalStore } from 'react'

/**
 * Subscribes to a media query in JavaScript.
 *
 * `prefers-reduced-motion` has to be readable from JS, not only from CSS: the
 * tetrahedron runs on requestAnimationFrame, where a CSS media query has no
 * effect. Subscribing rather than reading once means a mid-session preference
 * change takes effect without a reload.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  )
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
