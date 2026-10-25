import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { MaterialSystem } from '../types/graph'
import type { LegacyCore, LegacyLearning, ResearchGraph, ResearchIndex, TeachingSupport } from '../types/research'
import { loadResearch, localResearchEnabled } from '../data/researchClient'

export interface ResearchState {
  system: MaterialSystem
  enabled: boolean
  status: 'disabled' | 'idle' | 'loading' | 'ready' | 'error' | 'unavailable'
  error: string | null
  graph: ResearchGraph | null
  index: ResearchIndex | null
  core: LegacyCore | null
  learning: LegacyLearning | null
  teaching: TeachingSupport | null
  retry: () => void
}
const initial: ResearchState = { system: 'RHEA', enabled: localResearchEnabled, status: localResearchEnabled ? 'idle' : 'disabled', error: null, graph: null, index: null, core: null, learning: null, teaching: null, retry: () => undefined }
const Context = createContext<ResearchState>(initial)

export function ResearchProvider({ system, children }: { system: MaterialSystem; children: ReactNode }) {
  const [state, setState] = useState(initial)
  const started = useRef(false)
  const retry = useCallback(() => {
    if (!localResearchEnabled || system !== 'RHEA' || started.current) return
    started.current = true
    setState((previous) => previous.status === 'ready' || previous.status === 'loading' ? previous : { ...previous, status: 'loading', error: null })
    void loadResearch().then((loaded) => {
      setState({ ...initial, ...loaded, index: loaded.core.indexGraph(loaded.graph), status: 'ready' })
    }).catch((error: unknown) => { started.current = false; setState({ ...initial, status: 'error', error: error instanceof Error ? error.message : 'Local research could not be loaded.' }) })
  }, [system])
  const value = useMemo<ResearchState>(() => system === 'RHEA' ? { ...state, system, retry } : { ...initial, system, status: 'unavailable', retry }, [state, system, retry])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- The context hook shares its provider module.
export function useResearch() {
  const state = useContext(Context)
  const { status, enabled, retry } = state
  useEffect(() => { if (status === 'idle' && enabled) retry() }, [status, enabled, retry])
  return state
}
