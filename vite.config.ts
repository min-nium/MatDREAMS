import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { localResearchEnabled, localResearchPlugin } from './tools/local-research.ts'

export default defineConfig((env) => ({
  base: '/MatDREAMS/',
  plugins: [react(), localResearchPlugin()],
  define: { 'import.meta.env.VITE_LOCAL_RESEARCH': JSON.stringify(String(localResearchEnabled(env))) },
}))
