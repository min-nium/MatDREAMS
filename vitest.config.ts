import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/MatDREAMS/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
