import { storage } from 'wxt/storage'
import { browser } from 'wxt/browser'
import { UserSettings } from '@/utils/types'
import { defaultSettings, setConfig } from '@/services/configService'
import { errorLog, debugLog } from '.'

// #region Update settings from v1.x.x to v2.0.0
interface LegacyName {
  first: string
  middle: string
  last: string
}

interface LegacySettings {
  name: LegacyName | null
  deadname: LegacyName[] | null
  enabled: boolean | null
  stealthMode: boolean | null
  highlight: boolean | null
}

async function getLegacySettings(): Promise<LegacySettings | null> {
  try {
    // In the legacy version, each setting was stored in its own key
    // All settings were stored in sync storage
    const enabled = await storage.getItem<boolean>('sync:enabled')
    const deadnames = await storage.getItem<LegacyName[]>('sync:deadname')
    const name = await storage.getItem<LegacyName>('sync:name')
    const stealthMode = await storage.getItem<boolean>('sync:stealthMode')
    const highlight = await storage.getItem<boolean>('sync:highlight')

    // Return null if no legacy settings exist
    if (enabled === null && deadnames === null && name === null
      && stealthMode === null && highlight === null) {
      return null
    }

    return {
      name,
      deadname: deadnames,
      enabled,
      stealthMode,
      highlight,
    }
  }
  catch {
    errorLog('error getting legacy settings')
    return null
  }
}

function convertLegacyToNewFormat(legacy: LegacySettings): UserSettings {
  const newSettings: UserSettings = {
    ...defaultSettings,
    enabled: legacy.enabled ?? false,
    stealthMode: legacy.stealthMode ?? false,
    highlightReplacedNames: legacy.highlight ?? false,
    syncSettingsAcrossDevices: true,
    names: {
      first: [],
      middle: [],
      last: [],
    },
  }

  // Convert each deadname to new format
  legacy.deadname?.forEach((deadname) => {
    // Only add non-empty names
    if (deadname.first && legacy.name?.first) {
      newSettings.names.first.push({
        mappings: [deadname.first, legacy.name.first],
      })
    }
    if (deadname.middle && legacy.name?.middle) {
      newSettings.names.middle.push({
        mappings: [deadname.middle, legacy.name.middle],
      })
    }
    if (deadname.last && legacy.name?.last) {
      newSettings.names.last.push({
        mappings: [deadname.last, legacy.name.last],
      })
    }
  })

  return newSettings
}

function deduplicateNameMappings(settings: UserSettings): UserSettings {
  const deduped = { ...settings }

  // Deduplicate each name type (first, middle, last)
  for (const type of ['first', 'middle', 'last'] as const) {
    // Convert to string for comparison and filter duplicates
    const seen = new Set<string>()
    deduped.names[type] = settings.names[type].filter((mapping) => {
      const key = mapping.mappings.join('|')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  return deduped
}

export async function checkAndMigrateSettings(): Promise<void> {
  const legacySettings = await getLegacySettings()

  if (!legacySettings) {
    debugLog('no legacy settings found')
    return
  }

  debugLog('legacy settings detected, starting migration')

  // Convert and save to new format
  const newSettings = convertLegacyToNewFormat(legacySettings)

  debugLog('settings successfully migrated to v2.0.0 format', newSettings)

  try {
    await setConfig(newSettings)
    debugLog('settings successfully saved to sync storage')
  }
  catch (error) {
    const typedError = error as Error
    if (typedError.message.includes('Duplicate deadnames found')) {
      // Deduplicate and try saving again
      const dedupedSettings = deduplicateNameMappings(newSettings)
      await setConfig(dedupedSettings)
      debugLog('deduped settings successfully saved to sync storage')
    }
    else {
      errorLog('error saving settings', error)
      throw error
    }
  }

  // Clean up old storage
  await storage.removeItem('sync:enabled')
  await storage.removeItem('sync:deadname')
  await storage.removeItem('sync:name')
  await storage.removeItem('sync:stealthMode')
  await storage.removeItem('sync:highlight')
}
// #endregion

export async function createStealthUpgradeNotification(version: string): Promise<void> {
  // If stealth mode is enabled, set badge text and create notification system
  // See https://wxt.dev/guide/essentials/extension-apis.html#feature-detection
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  await (browser.action ?? browser.browserAction).setBadgeText({ text: version })
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  await (browser.action ?? browser.browserAction).setBadgeBackgroundColor({ color: '#8B5CF6' })

  // Store update info in storage so that the popup can show a toast without messaging.
  await storage.setItem('local:versionToShowUpgradeNotification', version)
}

export async function checkForStealthUpgradeNotification(): Promise<string | null> {
  const result = await storage.getItem<string>('local:versionToShowUpgradeNotification')
  return result
}

export async function clearStealthUpgradeNotification(): Promise<void> {
  await storage.removeItem('local:versionToShowUpgradeNotification')
  // See https://wxt.dev/guide/essentials/extension-apis.html#feature-detection
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  await (browser.action ?? browser.browserAction).setBadgeText({ text: '' })
}
