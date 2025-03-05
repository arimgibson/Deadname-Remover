import { test as base, chromium, type BrowserContext } from '@playwright/test'
import { resolve } from 'path'
import * as fs from 'fs'

// Extend the test fixture to include extension context
export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    // Get the path to the built extension
    const extensionPath = resolve(import.meta.dirname, '../.output/chrome-mv3')

    console.log(extensionPath)

    // Ensure the extension is built
    if (!fs.existsSync(extensionPath)) {
      throw new Error('Extension build not found. Run `bun run build` first.')
    }

    // Launch browser with the extension loaded
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions require headed mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    })

    await use(context)
    await context.close()
  },

  // Extract the extension ID for use in tests
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!background)
      background = await context.waitForEvent('serviceworker')

    const extensionId = background.url().split('/')[2]
    await use(extensionId)
  },
})

export { expect } from '@playwright/test'
