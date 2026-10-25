import { describe, expect, it, vi } from 'vitest'
import { fetchResearch, localResearchEnabled } from '../src/data/researchClient'

describe('private client boundary in ordinary/public mode', () => {
  it('never requests research data when local mode is disabled', async () => {
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    try {
      expect(localResearchEnabled).toBe(false)
      await expect(fetchResearch('graph')).rejects.toThrow('disabled')
      expect(fetcher).not.toHaveBeenCalled()
    } finally { vi.unstubAllGlobals() }
  })
})
