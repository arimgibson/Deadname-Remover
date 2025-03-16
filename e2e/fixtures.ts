import { test as base, chromium, type BrowserContext, Page } from '@playwright/test'
import { resolve } from 'path'
import * as fs from 'fs'
import { setupTestConfig } from './helpers/setupTestConfig'
import { UserSettings } from '@/utils/types'

// Extend the test fixture to include extension context and config setup
export const test = base.extend<{
  context: BrowserContext
  extensionId: string
  optionsPage: Page
  popupPage: Page
  setupConfig: (config?: Partial<UserSettings>) => Promise<void>
}>({
      // eslint-disable-next-line no-empty-pattern
      context: async ({}, use) => {
        // Get the path to the built extension
        const extensionPath = resolve(import.meta.dirname, '../.output/chrome-mv3')

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

      // Create a fixture for the options page
      optionsPage: async ({ context, extensionId }, use) => {
        const optionsPage = await context.newPage()
        await optionsPage.goto(`chrome-extension://${extensionId}/options.html`)
        await use(optionsPage)
      },

      // Create a fixture for the popup page
      popupPage: async ({ context, extensionId }, use) => {
        const popupPage = await context.newPage()
        await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
        await use(popupPage)
      },

      // Add a new fixture for setting up configuration
      setupConfig: async ({ context, extensionId }, use) => {
        // Create a function that tests can call to set up configuration
        const setupConfig = async (config?: Partial<UserSettings>) => {
          const page = await context.newPage()
          await setupTestConfig(page, extensionId, config)
          await page.close()
        }

        await use(setupConfig)
      },
    })

export { expect } from '@playwright/test'
