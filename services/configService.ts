import { siteFiltering } from '@/services/siteFiltering'
import {
  UserSettings,
  UserSettingsStorageVersion1,
  UserSettingsStorageVersion2,
  UserSettingsStorageVersion3,
  UserSettingsStorageVersion4,
} from '@/utils/types'
import { storage } from '#imports'
import { browser } from 'wxt/browser'
import * as v from 'valibot'
import { filterEmptyNamePairs } from '@/utils'
import { removeSelfMappings, removeRecursiveMappings } from '@/utils/migrations'

// Version history:
// Version 1: Initial structure (v2.0.0)
// Version 2: Resolve recursive name replacements (v2.0.2)
// Version 3: Added hideDebugInfo (v2.0.4)
// Version 4: Added email names and toggleKeybinding (v2.1.0)
// Version 5: Added allowlist, blocklist, and defaultAllowMode (v2.2.0)
const CURRENT_CONFIG_VERSION = 5

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

/**
 * Migrates user settings from version 1 to version 2.
 * Removes self and recursive name mappings that could cause infinite loops.
 * @param config - Version 1 user settings
 * @returns Version 2 user settings with problematic mappings removed
 */
function migrateToV2(config: UserSettingsStorageVersion1): UserSettingsStorageVersion2 {
  // Remove self and recursive mappings to prevent infinite loops
  let updated = removeSelfMappings(config)
  updated = removeRecursiveMappings(updated)
  return updated
}

/**
 * Migrates user settings from version 2 to version 3.
 * Adds the hideDebugInfo field for controlling debug output visibility.
 * @param config - Version 2 user settings
 * @returns Version 3 user settings with hideDebugInfo field
 */
function migrateToV3(config: UserSettingsStorageVersion2): UserSettingsStorageVersion3 {
  return {
    ...config,
    hideDebugInfo: false,
  }
}

/**
 * Migrates user settings from version 3 to version 4.
 * Adds email name mappings and keyboard shortcut toggle functionality.
 * @param config - Version 3 user settings
 * @returns Version 4 user settings with email names array and toggleKeybinding
 */
function migrateToV4(config: UserSettingsStorageVersion3): UserSettingsStorageVersion4 {
  return {
    ...config,
    names: {
      ...config.names,
      email: [],
    },
    toggleKeybinding: null,
  }
}

/**
 * Migrates user settings from version 4 to version 5.
 * Adds site filtering capabilities with allowlist, blocklist, and default mode.
 * @param config - Version 4 user settings
 * @returns Version 5 user settings with site filtering fields
 */
function migrateToV5(config: UserSettingsStorageVersion4): UserSettings {
  return {
    ...config,
    allowlist: [],
    blocklist: [],
    defaultAllowMode: true,
  }
}

// Versioned storage items for user settings
export const localConfigItem = storage.defineItem<UserSettings | null>('local:nameConfig', {
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    2: migrateToV2,
    3: migrateToV3,
    4: migrateToV4,
    5: migrateToV5,
  },
})

export const syncConfigItem = storage.defineItem<UserSettings | null>('sync:nameConfig', {
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    2: migrateToV2,
    3: migrateToV3,
    4: migrateToV4,
    5: migrateToV5,
  },
})

export async function getConfig(): Promise<UserSettings> {
  const localConfig = await localConfigItem.getValue()

  if (localConfig) {
    // If local config specifies sync settings, fetch from sync storage instead
    if (localConfig.syncSettingsAcrossDevices) {
      const syncConfig = await syncConfigItem.getValue()
      if (syncConfig) {
        return syncConfig
      }
    }
    return localConfig
  }

  // If no local config found, fetch from sync storage
  const syncConfig = await syncConfigItem.getValue()
  if (syncConfig) {
    return syncConfig
  }

  // Return default settings if no stored config is found
  return defaultSettings
}

export async function setConfig(settings: UserSettings): Promise<void> {
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
      await syncConfigItem.setValue(validatedConfig)
      await localConfigItem.removeValue()
    }
    else {
      // Switching FROM sync: just store in local
      await localConfigItem.setValue(validatedConfig)
    }
  }
  else {
    // No sync preference change, store in appropriate storage
    if (validatedConfig.syncSettingsAcrossDevices) {
      await syncConfigItem.setValue(validatedConfig)
      // Always clear local config when writing to sync to prevent stale local copy
      await localConfigItem.removeValue()
    }
    else {
      await localConfigItem.setValue(validatedConfig)
    }
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
  syncConfigItem.watch((config) => {
    if (config?.syncSettingsAcrossDevices) {
      callback(config)
    }
  })

  // Watch local storage
  localConfigItem.watch((config) => {
    if (config && !config.syncSettingsAcrossDevices) {
      callback(config)
    }
  })
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
    await localConfigItem.setValue({
      ...config,
      syncSettingsAcrossDevices: false,
    })
  }
  await syncConfigItem.removeValue()
}
