import { browser, Browser } from 'wxt/browser'
import {
  checkAndMigrateSettings,
  createStealthUpgradeNotification,
  removeSelfMappings,
  removeRecursiveMappings,
} from '@/utils/migrations'
import { compare } from 'compare-versions'
import { getConfig, setConfig } from '@/services/configService'
import { debugLog, errorLog, filterEmptyNamePairs } from '@/utils'

export async function handleInstall(_details: Browser.runtime.InstalledDetails) {
  await browser.tabs.create({ url: '/options.html?firstTime=true' })
}

export async function handleUpdate(details: Browser.runtime.InstalledDetails) {
  const currentVersion = browser.runtime.getManifest().version
  await debugLog('current version', currentVersion)
  await debugLog('previous version', details.previousVersion)

  await checkAndMigrateSettings()

  let config = await getConfig()

  // Migrate empty name pairs
  try {
    const cleanedNames = filterEmptyNamePairs(config.names)
    if (JSON.stringify(cleanedNames) !== JSON.stringify(config.names)) {
      await debugLog('removing empty name pairs')
      await setConfig(config)
      await debugLog('empty name pairs removed successfully')
    }
  }
  catch (error) {
    errorLog('error removing empty name pairs', error)
  }

  // Ensure hideDebugInfo is initialized
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- clean up later
  if (config.hideDebugInfo === undefined) {
    config.hideDebugInfo = false
    try {
      await setConfig(config)
    }
    catch (error) {
      errorLog('error setting hideDebugInfo config', error)
    }
  }

  // If last version is less than 2.0.0, open the options page with the upgrade flag
  if (details.previousVersion && compare(details.previousVersion, '2.0.0', '<')) {
    // If stealth mode is disabled, open the options page with the upgrade flag
    if (!config.stealthMode) {
      await browser.tabs.create({ url: `/options.html?upgrade=v2.0.0` })
      return
    }

    // If stealth mode is enabled, show a notification
    await createStealthUpgradeNotification('2.0.0')
  }
  else if (details.previousVersion === '2.0.0' && currentVersion === '2.0.1') {
    await debugLog('migrating settings from v2.0.0 to v2.0.1')
    try {
      await debugLog('removing self mappings')
      config = removeSelfMappings(config)
      await debugLog('removing recursive mappings')
      config = removeRecursiveMappings(config)
      await debugLog('saving settings')
      await setConfig(config)
    }
    catch (error) {
      errorLog('error migrating settings from v2.0.0 to v2.0.1', error)
    }
  }
}
