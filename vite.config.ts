import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { localResearchEnabled, localResearchPlugin } from './tools/local-research.ts'

const scientificPages = ['Materials', 'Definition', 'Relations', 'Engineering', 'Analysis', 'Manual']
const publicPages = fileURLToPath(new URL('./src/pages/PublicPages.tsx', import.meta.url))
const publicProvider = fileURLToPath(new URL('./src/app/PublicResearchProvider.tsx', import.meta.url))

/** Fail if a future import bypasses the production-only entry replacements. */
function publicBundleGuard(): Plugin {
  return {
    name: 'matdreams-public-bundle-guard',
    apply: 'build',
    generateBundle() {
      for (const id of this.getModuleIds()) {
        if (/\/src\/(?:data\/researchClient|app\/ResearchContext|components\/(?:research\/|graph\/Research)|pages\/(?:Materials|Definition|Relations|Engineering|Analysis|Manual)Page)/.test(id)) {
          this.error('Private research implementation entered the public module graph. Deployment refused.')
        }
      }
    },
  }
}

export default defineConfig((env) => ({
  base: '/MatDREAMS/',
  plugins: [react(), localResearchPlugin(), publicBundleGuard()],
  // All production builds use explanatory pages; local dev:research stays intact.
  resolve: { alias: env.command === 'build' ? [
    { find: './ResearchContext', replacement: publicProvider },
    ...scientificPages.map(name => ({ find: `../pages/${name}Page`, replacement: publicPages })),
  ] : [] },
  define: { 'import.meta.env.VITE_LOCAL_RESEARCH': JSON.stringify(String(localResearchEnabled(env))) },
}))
