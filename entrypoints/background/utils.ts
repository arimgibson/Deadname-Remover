import { browser, Runtime } from 'wxt/browser'
import { checkAndMigrateSettings, createStealthUpgradeNotification } from '@/utils/migrations'
import { compare } from 'compare-versions'
import { getConfig } from '@/services/configService'

export async function handleInstall(_details: Runtime.OnInstalledDetailsType) {
  await browser.tabs.create({ url: '/options.html?firstTime=true' })
}

export async function handleUpdate(details: Runtime.OnInstalledDetailsType) {
  await checkAndMigrateSettings()

  const config = await getConfig()

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
}
