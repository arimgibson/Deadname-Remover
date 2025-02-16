import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/sandbox'
import { handleInstall, handleUpdate } from './utils'
import { getConfig, updateExtensionAppearance } from '@/services/configService'

export default defineBackground({
  main: () => {
    // Check theming on extension load
    void (async () => {
      const config = await getConfig()
      await updateExtensionAppearance(config.stealthMode, config.theme)
    })()

    // Handle installation events
    browser.runtime.onInstalled.addListener((details) => {
      switch (details.reason) {
        case 'install':
          void handleInstall(details)
          break
        case 'update':
          void handleUpdate(details)
          break
        case 'browser_update':
        default:
          break
      }
    })
  },
})
