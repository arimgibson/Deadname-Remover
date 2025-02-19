import type { NameEntry, Names, NameTuple } from './types'

/**
 * Checks if there are any duplicate deadnames across all name categories (first, middle, last)
 * @param nameMappings - Object containing arrays of NameEntry for each name category
 * @returns boolean - true if no duplicates found, false if duplicates exist
 */
export function validateNoDuplicateDeadnames(nameMappings: Names) {
  const nameTuples = (Object.values(nameMappings).flat() as NameEntry[]).flatMap(({ mappings }) => mappings[0].toLowerCase())
  const duplicates = nameTuples.filter((item, index) => nameTuples.indexOf(item) !== index)
  return duplicates.length === 0
}

/**
 * Checks if there are any self mappings (e.g. "John" -> "John")
 * @param nameMappings - Object containing arrays of NameEntry for each name category
 * @returns boolean - true if no self mappings found, false if self mappings exist
 */
export function validateNoSelfMappings(nameMappings: Names) {
  const nameTuples: NameTuple[] = (Object.values(nameMappings).flat() as NameEntry[]).map(({ mappings }) => mappings)
  const selfMappings = nameTuples.filter(item => item[0].toLowerCase() === item[1].toLowerCase())
  return selfMappings.length === 0
}

/**
 * Checks if there are any recursive mappings (e.g. "John" -> "Doe" and "Doe" -> "John")
 * @param nameMappings - Object containing arrays of NameEntry for each name category
 * @returns boolean - true if no recursive mappings found, false if recursive mappings exist
 */
export function validateNoRecursiveMappings(nameMappings: Names) {
  const nameEntries = Object.values(nameMappings).flat() as NameEntry[]

  // Identify any mapping where a live name (entry.mappings[1]) is used as a dead name (other.mappings[0])
  // in any other mapping (self-mappings are ignored)
  const recursiveMappings = nameEntries.some((entry, i) =>
    nameEntries.some((other, j) => i !== j && entry.mappings[1].toLowerCase() === other.mappings[0].toLowerCase()),
  )

  return !recursiveMappings
}
