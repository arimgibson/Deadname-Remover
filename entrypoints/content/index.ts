import { defineContentScript } from '#imports'
import { getConfig, setupConfigListener } from '@/services/configService'
import { DOMObserver } from '@/services/domObserver'
import { TextProcessor } from '@/services/textProcessor'
import type { Names, UserSettings } from '@/utils/types'
import {
  blockContent,
  unblockContent,
  waitUntilDOMReady,
  createReplacementsMap,
  setStyle,
} from './utils'
import { debugLog, haveNamesChanged, registerKeyboardShortcut } from '@/utils'

let currentObserver: DOMObserver | null = null
let previousEnabled: boolean | undefined = undefined
let previousNames: Names | undefined = undefined
let previousTheme: UserSettings['theme'] | undefined = undefined
let previousHighlight: boolean | undefined = undefined
let toggleKeybindingListener: ((event: KeyboardEvent) => void) | null = null

async function configureAndRunProcessor({ config }: { config: UserSettings }): Promise<void> {
  // Only run disable logic if we're transitioning from enabled to disabled
  if (!config.enabled && previousEnabled) {
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
    return
  }

  // Skip if already disabled
  if (!config.enabled) {
    previousEnabled = false
    previousNames = undefined
    previousTheme = undefined
    return
  }

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
