import { UserSettings } from '@/utils/types'
import { storage } from '#imports'
import { browser } from 'wxt/browser'
import * as v from 'valibot'

export const defaultSettings: UserSettings = {
  names: {
    first: [],
    middle: [],
    last: [],
  },
  enabled: true,
  blockContentBeforeDone: true,
  stealthMode: false,
  hideDebugInfo: false,
  highlightReplacedNames: true,
  syncSettingsAcrossDevices: false,
  theme: 'trans',
  toggleKeybinding: null,
}

export async function getConfig(): Promise<UserSettings> {
  // Try local storage first
  const localConfig = await storage.getItem<UserSettings>('local:nameConfig')
  if (localConfig) {
    return localConfig
  }

  // Check sync storage if no local config found
  const syncConfig = await storage.getItem<UserSettings>('sync:nameConfig')
  if (syncConfig?.syncSettingsAcrossDevices) {
    return syncConfig
  }

  // Return default settings if no stored config is found
  return defaultSettings
}

export async function setConfig(config: UserSettings) {
  const validatedConfig = v.parse(UserSettings, config)
  const previousConfig = await getConfig()

  // Handle storage sync preference change
  if (previousConfig.syncSettingsAcrossDevices !== validatedConfig.syncSettingsAcrossDevices) {
    if (validatedConfig.syncSettingsAcrossDevices) {
      // Switching TO sync: move to sync storage and clean up local
      await storage.setItem('sync:nameConfig', validatedConfig)
      await storage.removeItem('local:nameConfig')
    }
    else {
      // Switching FROM sync: just store in local
      await storage.setItem('local:nameConfig', validatedConfig)
    }
  }
  else {
    // No sync preference change, store in appropriate storage
    const storageKey = validatedConfig.syncSettingsAcrossDevices ? 'sync:nameConfig' : 'local:nameConfig'
    await storage.setItem(storageKey, validatedConfig)
  }

  // Stealth Mode and Theme require updates unrelated to the content script
  // all other changes are automatically updated in the content script
  // via setupConfigListener and a callback to process the page
  if (previousConfig.stealthMode !== validatedConfig.stealthMode) {
    await handleStealthModeChange(validatedConfig.stealthMode)
  }

  if (previousConfig.theme !== validatedConfig.theme) {
    await handleThemeChange(validatedConfig.theme, validatedConfig.stealthMode)
  }
}

export function setupConfigListener(callback: (config: UserSettings) => void) {
  // Watch sync storage
  storage.watch<UserSettings>(
    'sync:nameConfig',
    (config) => {
      if (config?.syncSettingsAcrossDevices) {
        callback(config)
      }
    },
  )

  // Watch local storage
  storage.watch<UserSettings>(
    'local:nameConfig',
    (config) => {
      if (config && !config.syncSettingsAcrossDevices) {
        callback(config)
      }
    },
  )
}

export async function updateExtensionAppearance(stealthMode: boolean, theme: UserSettings['theme'] = 'trans'): Promise<void> {
  if (stealthMode) {
    await Promise.all([
      // See https://wxt.dev/guide/essentials/extension-apis.html#feature-detection
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (browser.action ?? browser.browserAction).setIcon({ path: 'icon/stealth.png' }),
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (browser.action ?? browser.browserAction).setTitle({ title: 'An experimental content filter' }),
    ])
    return
  }

  // Update icon based on theme
  const iconPath = theme === 'non-binary' ? 'icon/nb16.png' : 'icon/trans16.png'
  await Promise.all([
    // See https://wxt.dev/guide/essentials/extension-apis.html#feature-detection
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (browser.action ?? browser.browserAction).setIcon({ path: iconPath }),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (browser.action ?? browser.browserAction).setTitle({ title: 'Deadname Remover Settings' }),
  ])
}

async function handleStealthModeChange(enabled: boolean): Promise<void> {
  await updateExtensionAppearance(enabled)
}

async function handleThemeChange(theme: UserSettings['theme'], stealthMode: boolean): Promise<void> {
  await updateExtensionAppearance(stealthMode, theme)
}

export async function deleteSyncedData(isSynced: boolean): Promise<void> {
  if (isSynced) {
    const config = await getConfig()
    await storage.setItem('local:nameConfig', {
      ...config,
      syncSettingsAcrossDevices: false,
    })
  }
  await storage.removeItem('sync:nameConfig')
}
