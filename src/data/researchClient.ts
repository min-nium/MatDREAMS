import type { LegacyCore, LegacyLearning, ResearchGraph, TeachingSupport } from '../types/research'

export const localResearchEnabled = import.meta.env.DEV && import.meta.env.VITE_LOCAL_RESEARCH === 'true'
export const LOCAL_RESEARCH_PREFIX = '/__matdreams_local__/'
export const RESEARCH_SHA = '313d36d3adc4541c6d51e3f7086b47f12426513c91e46b461f125fb0815f4778'

declare global {
  interface Window { ChartCore?: LegacyCore; ChartLearning?: LegacyLearning }
}

export function researchDocumentUrl(key: string, download = false) {
  return `${LOCAL_RESEARCH_PREFIX}documents/${encodeURIComponent(key)}${download ? '?download=1' : ''}`
}
export function researchFigureUrl(key: string) {
  return `${LOCAL_RESEARCH_PREFIX}figures/${encodeURIComponent(key)}`
}
export async function fetchResearch<T>(path: string): Promise<T> {
  if (!localResearchEnabled) throw new Error('Local research mode is disabled. No private data was requested.')
  const response = await fetch(`${LOCAL_RESEARCH_PREFIX}${path}`, { credentials: 'omit', redirect: 'error' })
  if (!response.ok) throw new Error(`Local research service unavailable (${response.status}). Check the local-demo startup command.`)
  return response.json() as Promise<T>
}

function script(name: string) {
  return new Promise<void>((resolve, reject) => {
    const element = document.createElement('script')
    element.src = `${LOCAL_RESEARCH_PREFIX}legacy/${name}.js`
    element.onload = () => resolve()
    element.onerror = () => { element.remove(); reject(new Error(`Existing ${name} research helpers could not be loaded.`)) }
    document.head.append(element)
  })
}

let pending: Promise<{ graph: ResearchGraph; core: LegacyCore; learning: LegacyLearning; teaching: TeachingSupport }> | undefined
export function loadResearch() {
  if (!pending) {
    pending = (async () => {
      if (!localResearchEnabled) throw new Error('Local research mode is disabled.')
      const [graph, teaching] = await Promise.all([
        fetchResearch<ResearchGraph>('graph'), fetchResearch<TeachingSupport>('teaching'),
        script('core'), script('learning'),
      ])
      if (graph.release.graph_sha256 !== RESEARCH_SHA || graph.release.release_id !== 'rhea-system-chart-20261024-v4' || graph.release.mapping_version !== 'conservative-context-v5' || teaching.graph_release.graph_sha256 !== RESEARCH_SHA) {
        throw new Error('Local research release identity mismatch. No data accepted.')
      }
      if (!window.ChartCore || !window.ChartLearning) throw new Error('Legacy research helpers are unavailable.')
      return { graph, teaching, core: window.ChartCore, learning: window.ChartLearning }
    })().catch((error: unknown) => { pending = undefined; throw error })
  }
  return pending
}
