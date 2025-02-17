import { browser, Runtime } from 'wxt/browser'
import {
  checkAndMigrateSettings,
  createStealthUpgradeNotification,
  removeSelfMappings,
  removeRecursiveMappings,
} from '@/utils/migrations'
import { compare } from 'compare-versions'
import { getConfig, setConfig } from '@/services/configService'
import { debugLog, errorLog } from '@/utils'

export async function handleInstall(_details: Runtime.OnInstalledDetailsType) {
  await browser.tabs.create({ url: '/options.html?firstTime=true' })
}

export async function handleUpdate(details: Runtime.OnInstalledDetailsType) {
  const currentVersion = browser.runtime.getManifest().version
  debugLog('current version', currentVersion)
  debugLog('previous version', details.previousVersion)

  await checkAndMigrateSettings()

  let config = await getConfig()

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
    debugLog('migrating settings from v2.0.0 to v2.0.1')
    try {
      debugLog('removing self mappings')
      config = removeSelfMappings(config)
      debugLog('removing recursive mappings')
      config = removeRecursiveMappings(config)
      debugLog('saving settings')
      await setConfig(config)
    }
    catch (error) {
      errorLog('error migrating settings from v2.0.0 to v2.0.1', error)
    }
  }
}
