import { browser } from 'wxt/browser'
import { defineBackground, storage } from '#imports'
import { handleInstall, handleParsingStatusChange, handleUpdate } from './utils'
import { getConfig, updateExtensionAppearance } from '@/services/configService'
import { errorLog } from '@/utils'
import { parsingStatusItem } from '@/services/siteFiltering'
import type { Message, ParsingStatus } from '@/utils/types'

const activeTabIdItem = storage.defineItem<number | null>('local:activeTabId', { defaultValue: null })

export default defineBackground({
  main: () => {
    // Tracks the currently active tab. Persisted so it survives service-worker restarts.
    // sender.tab.id in onMessage does not require the `tabs` permission.
    let currentActiveTabId: number | null = null
    const activeTabIdReady = activeTabIdItem.getValue().then((id) => {
      currentActiveTabId = id
    })

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
    browser.runtime.onMessage.addListener((message: Message, sender) => {
      switch (message.type) {
        case 'PARSING_STATUS_CHANGE':
          void handleParsingStatusChange(message.data as { status: ParsingStatus })
          break
        case 'CANDIDATE_PARSING_STATUS':
          void activeTabIdReady.then(() => {
            // Only the active tab's candidate is applied; background tabs are silently dropped.
            if (sender.tab?.id === currentActiveTabId) {
              void (async () => {
                const { status } = message.data as { status: ParsingStatus }
                await parsingStatusItem.setValue(status)
                await handleParsingStatusChange({ status })
              })()
            }
          })
          break
      }
    })

    // Handle tab activation to recheck parsing status
    browser.tabs.onActivated.addListener((tab) => {
      currentActiveTabId = tab.tabId
      void activeTabIdItem.setValue(tab.tabId)
      void browser.tabs.sendMessage(tab.tabId, {
        type: 'RECHECK_PARSING_STATUS',
      }).catch((error: unknown) => {
        // Ignore "Receiving end does not exist" errors (e.g., chrome:// pages)
        if (error instanceof Error && error.message.includes('Receiving end does not exist.')) {
          return
        }
        // Log only — rethrowing would surface as an uncaught promise rejection in the service worker
        errorLog('error sending message to tab', error)
      })
    })
  },
})
