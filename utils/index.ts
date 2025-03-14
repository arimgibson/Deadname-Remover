import type { Difference } from 'microdiff'
import { Names } from './types'
import { getConfig } from '@/services/configService'

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
