import { defineContentScript } from '#imports'
import { getConfig, setupConfigListener } from '@/services/configService'
import { DOMObserver } from '@/services/domObserver'
import { TextProcessor } from '@/services/textProcessor'
import type { Names, UserSettings, ParsingStatus } from '@/utils/types'
import {
  blockContent,
  unblockContent,
  waitUntilDOMReady,
  createReplacementsMap,
  setStyle,
} from './utils'
import { debugLog, haveNamesChanged, registerKeyboardShortcut } from '@/utils'
import { storage } from '#imports'

let currentObserver: DOMObserver | null = null
let previousEnabled: boolean | undefined = undefined
let previousNames: Names | undefined = undefined
let previousTheme: UserSettings['theme'] | undefined = undefined
let previousHighlight: boolean | undefined = undefined
let toggleKeybindingListener: ((event: KeyboardEvent) => void) | null = null

function cleanupAndReset() {
  if (currentObserver) {
    currentObserver.disconnect()
    currentObserver = null
  }

  // Revert all text replacements and remove theme
  TextProcessor.revertAllReplacements()
  document.querySelector('style[deadname]')?.remove()
  previousEnabled = false
  previousNames = undefined
  previousTheme = undefined
}

async function updateParsingStatus(status: Omit<ParsingStatus, 'site' | 'timestamp'>) {
  await storage.setItem('local:parsingStatus', {
    ...status,
    site: window.location.hostname,
    timestamp: Date.now(),
  } as ParsingStatus)
}

async function configureAndRunProcessor({ config }: { config: UserSettings }): Promise<void> {
  // Check if site should be parsed
  const shouldParse = shouldParseSite({ config })

  // Handle any transition to disabled state (either by extension disable or blocklist/whitelist)
  if ((!config.enabled || !shouldParse) && previousEnabled) {
    cleanupAndReset()
    if (!config.enabled) {
      await updateParsingStatus({ isParsing: false, reason: 'disabled' })
      await debugLog('extension disabled')
    }
    else if (!shouldParse) {
      await updateParsingStatus({ isParsing: false, reason: 'blocked' })
      await debugLog('not parsing site, blocklist or allowlist is set')
    }
    return
  }

  // Skip if disabled or site is blocked/not whitelisted
  if (!config.enabled || !shouldParse) {
    if (!config.enabled) {
      await updateParsingStatus({ isParsing: false, reason: 'disabled' })
    }
    else {
      await updateParsingStatus({ isParsing: false, reason: 'blocked' })
    }
    previousEnabled = false
    previousNames = undefined
    previousTheme = undefined
    return
  }

  // If we reach here, parsing is enabled
  await updateParsingStatus({ isParsing: true, reason: 'enabled' })

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

  // Move these assignments to after all processing is complete
  previousEnabled = true
  previousNames = config.names
  previousTheme = config.theme
  previousHighlight = config.highlightReplacedNames
}

function getMostSpecificMatch(list: string[], site: string): string | null {
  // Return the longest matching prefix
  const matches = list.filter(entry => site.startsWith(entry))
  if (matches.length === 0) return null
  return matches.reduce((a, b) => (b.length > a.length ? b : a))
}

// check config global block list and white list if the parsing should continue
function shouldParseSite({ config }: { config: UserSettings }) {
  const { hostname, pathname } = window.location
  const fullUrl = `${hostname.replace(/^www\./, '')}${pathname}`
  const allowMatch = getMostSpecificMatch(config.allowlist, fullUrl)
  const blockMatch = getMostSpecificMatch(config.blocklist, fullUrl)

  if (config.defaultAllowMode) {
    if (!blockMatch) return true
    if (!allowMatch) return false

    return allowMatch.length >= blockMatch.length
  }
  else {
    if (!allowMatch) return false
    if (!blockMatch) return true

    return allowMatch.length >= blockMatch.length
  }
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: async () => {
    await debugLog('loaded')

    const config = await getConfig()
    await configureAndRunProcessor({ config })
    toggleKeybindingListener = await registerKeyboardShortcut({ config, listener: toggleKeybindingListener })

    // Handle configuration changes
    setupConfigListener((config) => {
      void (async () => {
        await configureAndRunProcessor({ config })
        toggleKeybindingListener = await registerKeyboardShortcut({ config, listener: toggleKeybindingListener })
      })()
    })
  },
})
