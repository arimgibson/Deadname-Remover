import { browser, Browser } from 'wxt/browser'
import {
  checkAndMigrateSettings,
  createStealthUpgradeNotification,
} from '@/utils/migrations'
import { compare } from 'compare-versions'
import { getConfig, updateExtensionAppearance } from '@/services/configService'
import { debugLog } from '@/utils'
import type { ParsingStatus } from '@/utils/types'

export async function handleInstall(_details: Browser.runtime.InstalledDetails) {
  await browser.tabs.create({ url: '/options.html?firstTime=true' })
}

export async function handleUpdate(details: Browser.runtime.InstalledDetails) {
  const currentVersion = browser.runtime.getManifest().version
  await debugLog('current version', currentVersion)
  await debugLog('previous version', details.previousVersion)

  // Migrate from v1.x.x legacy format if needed
  await checkAndMigrateSettings()

  const config = await getConfig()

  // Show upgrade notifications as needed
  if (details.previousVersion && compare(details.previousVersion, '2.0.0', '<')) {
    // If stealth mode is disabled, open the options page with the upgrade flag
    if (!config.stealthMode) {
      await browser.tabs.create({ url: `/options.html?upgrade=v2.0.0` })
    }
    else {
      // If stealth mode is enabled, show a notification
      await createStealthUpgradeNotification('2.0.0')
    }
  }
}

export async function handleParsingStatusChange({ status }: { status: ParsingStatus }) {
  const config = await getConfig()
  await updateExtensionAppearance({
    enabled: config.enabled,
    stealthMode: config.stealthMode,
    isParsing: status.isParsing,
    theme: config.theme,
  })
}
