import { UserSettings } from '@/utils/types'
import { defaultSettings } from '@/services/configService'
import { Page } from '@playwright/test'

/**
 * Sets up the extension configuration for testing
 *
 * @param page - The Playwright page object
 * @param extensionId - The extension ID
 * @param config - Partial settings to override defaults
 */
export async function setupTestConfig(
  page: Page,
  extensionId: string,
  config: Partial<UserSettings> = {},
) {
  // Combine default settings with test overrides
  const testConfig: UserSettings = {
    ...defaultSettings,
    ...config,
  }

  // Use the extension's storage API via page.evaluate
  await page.goto(`chrome-extension://${extensionId}/options.html`)

  // Set the configuration directly in the browser context
  await page.evaluate((settings: UserSettings) => {
    // This runs in the browser context
    const storageKey = settings.syncSettingsAcrossDevices
      ? 'sync:nameConfig'
      : 'local:nameConfig'

    // Use localStorage as a direct way to set the config
    localStorage.setItem(storageKey, JSON.stringify(settings))

    // Dispatch a storage event to notify the extension
    window.dispatchEvent(new StorageEvent('storage', {
      key: storageKey,
      newValue: JSON.stringify(settings),
    }))
  }, testConfig)

  // Give the extension a moment to process the settings
  await page.waitForTimeout(500)
}

/**
 * Creates test configuration with name pairs for testing
 */
export function createTestNameConfig(
  deadname = 'OldName',
  chosenName = 'NewName',
): Partial<UserSettings> {
  return {
    names: {
      first: [{ mappings: [deadname, chosenName] }],
      middle: [],
      last: [],
    },
    enabled: true,
    highlightReplacedNames: true,
  }
}
