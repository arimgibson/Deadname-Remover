import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    // Only include unit tests, exclude e2e tests
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['e2e/**/*', 'node_modules'],
  },
})
