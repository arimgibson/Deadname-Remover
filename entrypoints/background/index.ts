import { browser } from 'wxt/browser'
import { defineBackground } from '#imports'
import { handleInstall, handleParsingStatusChange, handleUpdate } from './utils'
import { getConfig, updateExtensionAppearance } from '@/services/configService'
import { errorLog } from '@/utils'
import type { Message, ParsingStatus } from '@/utils/types'

export default defineBackground({
  main: () => {
    // Check theming on extension load
    void (async () => {
      const config = await getConfig()
      await updateExtensionAppearance({
        enabled: config.enabled,
        stealthMode: config.stealthMode,
        theme: config.theme,
      })
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
        case 'chrome_update':
        default:
          break
      }
    })

    // Handle messages from content scripts, popup, or options pages
    browser.runtime.onMessage.addListener((message: Message, _sender) => {
      switch (message.type) {
        case 'PARSING_STATUS_CHANGE':
          void handleParsingStatusChange(message.data as { status: ParsingStatus })
      }
    })

    // Handle tab activation to recheck parsing status
    browser.tabs.onActivated.addListener((tab) => {
      void browser.tabs.sendMessage(tab.tabId, {
        type: 'RECHECK_PARSING_STATUS',
      }).catch((error: unknown) => {
        // Ignore "Receiving end does not exist" errors (e.g., chrome:// pages)
        // but allow other errors to be logged
        if (error instanceof Error && error.message.includes('Receiving end does not exist.')) {
          return
        }
        errorLog('error sending message to tab', error)
        throw error
      })
    })
  },
})
