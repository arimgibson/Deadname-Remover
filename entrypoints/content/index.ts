import { defineContentScript } from '#imports'
import { getConfig, setupConfigListener } from '@/services/configService'
import { DOMObserver } from '@/services/domObserver'
import { TextProcessor } from '@/services/textProcessor'
import type { Names, UserSettings, ParsingStatus, Message } from '@/utils/types'
import {
  blockContent,
  unblockContent,
  waitUntilDOMReady,
  createReplacementsMap,
  setStyle,
} from './utils'
import { debugLog, haveNamesChanged, registerKeyboardShortcut } from '@/utils'
import { SiteFiltering } from '@/services/siteFiltering'

let currentObserver: DOMObserver | null = null
let previousEnabled: boolean | undefined = undefined
let previousNames: Names | undefined = undefined
let previousTheme: UserSettings['theme'] | undefined = undefined
let previousHighlight: boolean | undefined = undefined
let toggleKeybindingListener: ((event: KeyboardEvent) => void) | null = null
const siteFiltering = new SiteFiltering()

function cleanupAndReset() {
  if (previousEnabled) {
    if (currentObserver) {
      currentObserver.disconnect()
      currentObserver = null
    }

    // Revert all text replacements and remove theme
    TextProcessor.revertAllReplacements()
    document.querySelector('style[deadname]')?.remove()
  }
  previousEnabled = false
  previousNames = undefined
  previousTheme = undefined
  previousHighlight = undefined
}

// Writes parsingStatus either directly (initial load / recheck) or via a background-mediated
// candidate message (config changes). The background only commits a candidate if the sending
// tab is the currently active one, preventing background tabs from overwriting the status.
async function publishParsingStatus(
  args: {
    status: Omit<ParsingStatus, 'site' | 'timestamp'>
    hostname: string
    theme: UserSettings['theme']
  },
  mode: 'direct' | 'candidate',
): Promise<void> {
  if (mode === 'direct') {
    await siteFiltering.updateParsingStatus(args)
    return
  }
  const newStatus: ParsingStatus = { ...args.status, site: args.hostname, timestamp: Date.now() }
  await browser.runtime.sendMessage({
    type: 'CANDIDATE_PARSING_STATUS',
    data: { status: newStatus },
  }).catch(() => {
    // Service worker may be restarting; candidate dropped and recovered on next tab focus
  })
}

async function configureAndRunProcessor({
  config,
  statusMode = 'direct',
}: {
  config: UserSettings
  statusMode?: 'direct' | 'candidate'
}): Promise<void> {
  // Handle any transition to disabled state (either by extension disable or blocklist/allowlist)
  if (!config.enabled) {
    const wasEnabledBeforeCleanup = previousEnabled
    cleanupAndReset()
    await publishParsingStatus({
      status: {
        isParsing: false,
        reason: 'extension_disabled',
        allowMatch: null,
        blockMatch: null,
      },
      hostname: window.location.hostname,
      theme: config.theme,
    }, statusMode)
    if (wasEnabledBeforeCleanup) {
      await debugLog('extension disabled')
    }
    return
  }

  // Check if site should be parsed
  const siteFilterResult = siteFiltering.shouldParseSite({ config })

  if (!siteFilterResult.shouldParse) {
    cleanupAndReset()
    await publishParsingStatus({
      status: {
        isParsing: false,
        reason: siteFilterResult.reason,
        allowMatch: siteFilterResult.allowMatch,
        blockMatch: siteFilterResult.blockMatch,
      },
      hostname: window.location.hostname,
      theme: config.theme,
    }, statusMode)
    await debugLog(`not parsing site, reason: ${siteFilterResult.reason}, allowMatch: ${siteFilterResult.allowMatch ?? 'none'}, blockMatch: ${siteFilterResult.blockMatch ?? 'none'}`)
    return
  }

  // If we reach here, parsing is enabled
  await publishParsingStatus({
    status: {
      isParsing: true,
      reason: siteFilterResult.reason,
      allowMatch: siteFilterResult.allowMatch,
      blockMatch: siteFilterResult.blockMatch,
    },
    hostname: window.location.hostname,
    theme: config.theme,
  }, statusMode)

  // Check if names, theme, or highlightReplacedNames have changed
  const namesChanged = previousEnabled && haveNamesChanged(previousNames, config.names)
  const themeChanged = previousEnabled && previousTheme !== config.theme
  const highlightChanged = previousEnabled && previousHighlight !== config.highlightReplacedNames

  if (namesChanged) {
    await debugLog('names changed, reverting replacements to reapply with new names')
    TextProcessor.revertAllReplacements()
  }

  if (themeChanged) {
    await debugLog('theme changed, removing style to apply new theme')
    document.querySelector('style[deadname]')?.remove()
  }

  // Always update theme if it changed or on first enable
  if (!previousEnabled || themeChanged || highlightChanged) {
    setStyle({
      document,
      theme: config.theme,
      highlight: config.highlightReplacedNames,
    })
  }

  // Only proceed with setup if enabled and either it's the first run or names changed
  if (!previousEnabled || namesChanged) {
    // Disconnect previous observer to clean up and avoid memory leaks
    currentObserver?.disconnect()

    const textProcessor = new TextProcessor()
    const domObserver = new DOMObserver(textProcessor)
    currentObserver = domObserver

    const replacements = createReplacementsMap(config.names)

    await debugLog('replacements', replacements)
    if (config.blockContentBeforeDone) {
      await debugLog('blocking content')
      blockContent()
    }

    await waitUntilDOMReady()
    await debugLog('Initial document processing starting')

    // Await the full processing of the document body.
    await textProcessor.processDocument({
      root: document.body,
      replacements,
      asyncProcessing: !config.blockContentBeforeDone,
    })
    await debugLog('Initial document processing complete')

    if (config.blockContentBeforeDone) {
      await debugLog('unblocking content')
      unblockContent()
    }

    // Set up the observer for handling subsequent mutations (which do not block content).
    await debugLog('Setting up mutation observer')
    currentObserver.setup(replacements)
    await debugLog('Observer setup complete')
  }

  // Run these assignments to after all processing is complete
  previousEnabled = true
  previousNames = config.names
  previousTheme = config.theme
  previousHighlight = config.highlightReplacedNames
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: async () => {
    await debugLog('loaded')

    const config = await getConfig()
    await configureAndRunProcessor({ config })
    toggleKeybindingListener = await registerKeyboardShortcut({ config, listener: toggleKeybindingListener })

    setupConfigListener((config) => {
      void (async () => {
        await configureAndRunProcessor({ config, statusMode: 'candidate' })
        toggleKeybindingListener = await registerKeyboardShortcut({ config, listener: toggleKeybindingListener })
      })()
    })

    // Recheck parsing status when the tab becomes visible
    browser.runtime.onMessage.addListener((message: Message, _sender) => {
      if (message.type === 'RECHECK_PARSING_STATUS') {
        void (async () => {
          const config = await getConfig()
          await configureAndRunProcessor({ config })
        })()
      }
    })
  },
})
