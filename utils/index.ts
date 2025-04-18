/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { Difference } from 'microdiff'
import { Names, UserSettings } from './types'
import { getConfig, setConfig } from '@/services/configService'

export async function debugLog(message: string, ...data: unknown[]) {
  const { hideDebugInfo } = await getConfig()
  if (hideDebugInfo) return

  console.debug(`Deadname Remover: ${message}`, ...data)
}

export function errorLog(message: string, ...data: unknown[]) {
  console.error(`Deadname Remover: ${message}`, ...data)
}

/**
 * Filters out empty arrays from the diff generated by microdiff
 * @param diff - The diff to filter
 * @returns The filtered diff
 */
export function filterEmptyArraysFromDiff(diff: Difference[]) {
  return diff.filter(change =>
    change.type !== 'CREATE'
    || !(Array.isArray(change.value) && change.value[0] === '' && change.value[1] === ''),
  )
}

/**
 * Compares two Names arrays deeply to check for any changes
 * @param previous - Previous Names array
 * @param current - Current Names array
 * @returns boolean - true if arrays are different, false if they're the same
 */
export function haveNamesChanged(previous: Names | undefined, current: Names): boolean {
  if (!previous) return true

  // Compare each category (first, middle, last names)
  for (const category in previous) {
    const prevNames = previous[category as keyof Names]
    const currNames = current[category as keyof Names]

    // Check if arrays exist and have same length
    if (prevNames.length !== currNames.length) {
      return true
    }

    // Compare each [deadname, chosenname] tuple
    for (let i = 0; i < prevNames.length; i++) {
      const [prevDead, prevChosen] = prevNames[i].mappings
      const [currDead, currChosen] = currNames[i].mappings

      if (prevDead !== currDead || prevChosen !== currChosen) {
        return true
      }
    }
  }

  return false
}

export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

/**
 * Formats a keyboard shortcut object into a human-readable string.
 *
 * @param shortcut - The shortcut object to format.
 * @returns A string representation of the shortcut, or null if the shortcut is undefined.
 */
export function formatKeyboardShortcut(shortcut: UserSettings['toggleKeybinding']): string | null {
  if (!shortcut) return null

  const parts: string[] = []

  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.meta) parts.push('Meta')

  // Format key nicely
  let key = shortcut.key
  if (key === ' ') key = 'Space'
  else if (key.length === 1) key = key.toUpperCase()
  else if (key === 'Escape') key = 'Esc'

  parts.push(key)

  return parts.join(' + ')
}

/**
 * Filters out empty name pairs (where both deadname and proper name are empty)
 * from all name categories
 * @param nameMappings - Original name mappings object
 * @returns Names - Filtered name mappings with empty pairs removed
 */
export function filterEmptyNamePairs(nameMappings: Names): Names {
  const result: Names = {
    first: [],
    middle: [],
    last: [],
    email: [],
  }

  for (const category of ['first', 'middle', 'last', 'email'] as const) {
    result[category] = nameMappings?.[category]?.filter(
      pair => !(pair.mappings[0] === '' && pair.mappings[1] === ''),
    ) ?? []
  }

  return result
}

/**
 * Registers a keyboard shortcut for the enabling and disabling the extension
 * @param config - The user's current config
 * @param listener - The existing listener to remove, if it exists
 * @returns A new listener function, or null if no listener was provided
 */
export async function registerKeyboardShortcut({
  config,
  listener,
}: {
  config: UserSettings
  listener: ((event: KeyboardEvent) => void) | null
}): Promise<((event: KeyboardEvent) => void) | null> {
  if (listener) {
    document.removeEventListener('keydown', listener, true)
  }

  const toggleKeybinding = config.toggleKeybinding
  if (!toggleKeybinding) {
    await debugLog('no toggle keybinding found, skipping keyboard shortcut registration')
    return null
  }

  await debugLog('registering keyboard shortcut', toggleKeybinding)

  // Create a new listener function and store reference
  listener = (event: KeyboardEvent) => {
    // Skip the event if originates from editable element
    const tagName = (event.target as HTMLElement).tagName.toLowerCase()
    if (['input', 'textarea', 'select'].includes(tagName)
      || (event.target as HTMLElement).isContentEditable) {
      return
    }

    if (event.key === toggleKeybinding.key
      && event.altKey === toggleKeybinding.alt
      && event.ctrlKey === toggleKeybinding.ctrl
      && event.shiftKey === toggleKeybinding.shift
      && event.metaKey === toggleKeybinding.meta
    ) {
      event.preventDefault()
      void (async () => {
        await debugLog(`toggle keybinding pressed, ${config.enabled ? 'disabling' : 'enabling'}`)
        config.enabled = !config.enabled
        void setConfig(config)
      })()
    }
  }

  // Add the new listener with capturing (true as third parameter)
  document.addEventListener('keydown', listener, true)

  return listener
}
