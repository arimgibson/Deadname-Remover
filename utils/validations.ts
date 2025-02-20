import type { NameEntry, Names, NameTuple } from './types'

/**
 * Validates that there are no duplicate deadnames across all name categories.
 *
 * This function flattens the provided name mappings to extract the primary deadname
 * from each entry, converting each to lowercase to ensure case-insensitive comparisons.
 * It then checks for duplicates by identifying any deadname whose first occurrence
 * index does not match its current position. The function returns `true` if all
 * deadnames are unique, and `false` if any duplicates are found.
 *
 * @param nameMappings - An object containing arrays of `NameEntry` for each name category (e.g., first, middle, last).
 * @returns `true` if no duplicate deadnames are found; otherwise, `false`.
 *
 * @example
 * const nameMappings = {
 *   first: [{ mappings: ['John', 'Johnny'] }],
 *   middle: [{ mappings: ['Doe', 'Doey'] }],
 *   last: [{ mappings: ['Doe'] }]
 * };
 *
 * const isUnique = validateNoDuplicateDeadnames(nameMappings);
 * console.log(isUnique); // Outputs: true if no duplicates exist, false otherwise
 */
export function validateNoDuplicateDeadnames(nameMappings: Names) {
  const nameTuples = (Object.values(nameMappings).flat() as NameEntry[]).flatMap(({ mappings }) => mappings[0].toLowerCase())
  const duplicates = nameTuples.filter((item, index) => nameTuples.indexOf(item) !== index)
  return duplicates.length === 0
}

/**
 * Validates that there are no self mappings in the provided name mappings.
 *
 * This function examines all name entries to ensure that no mapping directly maps a name to itself,
 * where a self mapping is identified when both names are equal after converting to lowercase.
 *
 * @param nameMappings - An object containing arrays of `NameEntry` for each name category. Each entry's `mappings` property is expected to be a tuple where the first element is the source name and the second is the target name.
 * @returns true if no self mappings are found; false otherwise.
 */
export function validateNoSelfMappings(nameMappings: Names) {
  const nameTuples: NameTuple[] = (Object.values(nameMappings).flat() as NameEntry[]).map(({ mappings }) => mappings)
  const selfMappings = nameTuples.filter(item => item[0].toLowerCase() === item[1].toLowerCase())
  return selfMappings.length === 0
}

/**
 * Validates that there are no recursive mappings within the provided name mappings.
 *
 * This function examines all name entries by flattening the arrays contained in the `nameMappings` object.
 * It checks for recursive relationships where a "live" name (the second element of a mapping) from one entry
 * is used as a "dead" name (the first element) in another entry, ignoring cases where a name maps to itself.
 * All comparisons are performed in a case-insensitive manner.
 *
 * @param nameMappings - An object containing arrays of name entries, where each entry has a `mappings` array.
 * The first element in the `mappings` array represents the deadname, and the second represents the live name.
 *
 * @returns Returns `true` if no recursive mappings are found, and `false` if a recursive mapping exists.
 *
 * @example
 * const mappings = {
 *   categoryA: [{ mappings: ["John", "Doe"] }],
 *   categoryB: [{ mappings: ["Doe", "John"] }]
 * }
 * console.log(validateNoRecursiveMappings(mappings)) // Outputs: false
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
