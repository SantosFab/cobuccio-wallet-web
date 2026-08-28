import { defineConfig } from 'vitest/config'

// Only pure logic (masks, validators, zod schemas) is covered so far —
// none of it touches the DOM, so the default "node" environment is fine
// and keeps runs fast. Switch to "jsdom" (and add it as a dependency)
// if/when component tests are introduced.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
})
