import { siteFiltering } from '@/services/siteFiltering'
import { UserSettings } from '@/utils/types'
import { storage } from '#imports'
import { browser } from 'wxt/browser'
import * as v from 'valibot'
import { filterEmptyNamePairs } from '@/utils'

export const defaultSettings: UserSettings = {
  names: {
    first: [],
    middle: [],
    last: [],
    email: [],
  },
  enabled: true,
  blockContentBeforeDone: true,
  defaultAllowMode: true,
  stealthMode: false,
  hideDebugInfo: false,
  highlightReplacedNames: true,
  syncSettingsAcrossDevices: false,
  theme: 'trans',
  toggleKeybinding: null,
  allowlist: [],
  blocklist: [],
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

export async function setConfig(settings: UserSettings): Promise<void> {
  // temp migrations to prevent breaking changes
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (settings.toggleKeybinding === undefined) {
    settings.toggleKeybinding = null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (settings.names.email === undefined || settings.names.email.length === 0) {
    settings.names.email = []
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  settings.hideDebugInfo ??= false

  const cleanedSettings = {
    ...settings,
    names: filterEmptyNamePairs(settings.names),
  }

  const validatedConfig = v.parse(UserSettings, cleanedSettings)
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

  // Enabled/Disabled, Stealth Mode, and Theme require updates unrelated to the content script
  // all other changes are automatically updated in the content script
  // via setupConfigListener and a callback to process the page
  if (previousConfig.enabled !== validatedConfig.enabled) {
    await handleEnabledChange({
      enabled: validatedConfig.enabled,
      stealthMode: validatedConfig.stealthMode,
    })
  }

  if (previousConfig.stealthMode !== validatedConfig.stealthMode) {
    await handleStealthModeChange({
      enabled: validatedConfig.enabled,
      stealthMode: validatedConfig.stealthMode,
    })
  }

  if (previousConfig.theme !== validatedConfig.theme) {
    await handleThemeChange({
      enabled: validatedConfig.enabled,
      stealthMode: validatedConfig.stealthMode,
      theme: validatedConfig.theme,
    })
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

export async function updateExtensionAppearance({
  enabled,
  stealthMode,
  isParsing,
  theme = 'trans',
}: {
  enabled: boolean
  stealthMode: boolean
  isParsing?: boolean
  theme?: UserSettings['theme']
}): Promise<void> {
  // Priority: stealth > disabled > parsing > normal
  let iconPath: string
  let title: string

  if (stealthMode) {
    iconPath = 'icon/stealth.png'
    title = 'An experimental content filter'
  }
  else if (!enabled) {
    iconPath = theme === 'non-binary' ? 'icon/nb16-disabled.png' : 'icon/trans16-disabled.png'
    title = 'Deadname Remover Settings'
  }
  // Parsing is false, meaning this page is blocked
  else if (isParsing === false) {
    iconPath = theme === 'non-binary' ? 'icon/nb16-blocked.png' : 'icon/trans16-blocked.png'
    title = 'An experimental content filter'
  }
  else {
    iconPath = theme === 'non-binary' ? 'icon/nb16.png' : 'icon/trans16.png'
    title = 'Deadname Remover Settings'
  }

  await Promise.all([
    // See https://wxt.dev/guide/essentials/extension-apis.html#feature-detection
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (browser.action ?? browser.browserAction).setIcon({ path: iconPath }),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (browser.action ?? browser.browserAction).setTitle({ title }),
  ])
}

async function handleEnabledChange({ enabled, stealthMode }: { enabled: boolean, stealthMode: boolean }): Promise<void> {
  // Don't want to override stealth mode icon when enabling/disabling the extension
  if (stealthMode) {
    return
  }
  const parsingStatus = await siteFiltering.getParsingStatus()
  await updateExtensionAppearance({ enabled, stealthMode: false, isParsing: parsingStatus?.isParsing })
}

async function handleStealthModeChange({ enabled, stealthMode }: { enabled: boolean, stealthMode: boolean }): Promise<void> {
  const parsingStatus = await siteFiltering.getParsingStatus()
  await updateExtensionAppearance({ enabled, stealthMode, isParsing: parsingStatus?.isParsing })
}

async function handleThemeChange({ enabled, stealthMode, theme }: { enabled: boolean, stealthMode: boolean, theme: UserSettings['theme'] }): Promise<void> {
  const parsingStatus = await siteFiltering.getParsingStatus()
  await updateExtensionAppearance({ enabled, stealthMode, theme, isParsing: parsingStatus?.isParsing })
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
