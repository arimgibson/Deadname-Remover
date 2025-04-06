import type { NameEntry, Names, NameTuple } from './types'
import { filterEmptyNamePairs } from './index'
/**
 * Checks if there are any duplicate deadnames across all name categories (first, middle, last)
 * @param nameMappings - Object containing arrays of NameEntry for each name category
 * @returns boolean - true if no duplicates found, false if duplicates exist
 */
export function validateNoDuplicateDeadnames(nameMappings: Names) {
  const filteredNameMappings = filterEmptyNamePairs(nameMappings)

  const deadnames = (Object.values(filteredNameMappings).flat() as NameEntry[]).flatMap(({ mappings }) => mappings[0].toLowerCase())
  const uniqueDeadnames = new Set(deadnames)
  return uniqueDeadnames.size === deadnames.length
}

/**
 * Checks if there are any self mappings (e.g. "John" -> "John")
 * @param nameMappings - Object containing arrays of NameEntry for each name category
 * @returns boolean - true if no self mappings found, false if self mappings exist
 */
export function validateNoSelfMappings(nameMappings: Names) {
  const filteredNameMappings = filterEmptyNamePairs(nameMappings)

  const nameTuples: NameTuple[] = (Object.values(filteredNameMappings).flat() as NameEntry[]).map(({ mappings }) => mappings)
  const hasSelfMapping = nameTuples.some(item => item[0].toLowerCase() === item[1].toLowerCase())
  return !hasSelfMapping
}

/**
 * Checks if there are any recursive mappings (e.g. "John" -> "Doe" and "Doe" -> "John")
 * @param nameMappings - Object containing arrays of NameEntry for each name category
 * @returns boolean - true if no recursive mappings found, false if recursive mappings exist
 */
export function validateNoRecursiveMappings(nameMappings: Names) {
  const filteredNameMappings = filterEmptyNamePairs(nameMappings)
  const nameEntries = Object.values(filteredNameMappings).flat() as NameEntry[]

  // Create a Map of lowercase live names to their indices
  const liveNameMap = new Map(
    nameEntries.map((entry, index) => [entry.mappings[1].toLowerCase(), index]),
  )

  // Check if any dead name exists as a live name (excluding self)
  const recursiveMappings = nameEntries.some((entry, i) => {
    const matchingLiveNameIndex = liveNameMap.get(entry.mappings[0].toLowerCase())
    return matchingLiveNameIndex !== undefined && matchingLiveNameIndex !== i
  })

  return !recursiveMappings
}
