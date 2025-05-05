import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'

export default defineConfig({
  // @ts-expect-error -- version mismatches, not a big deal. Should be resolved soon
  plugins: [WxtVitest()],
})
