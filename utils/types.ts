import * as v from 'valibot'
import { validateNoDuplicateDeadnames, validateNoRecursiveMappings, validateNoSelfMappings } from './validations'

const trimmedString = v.pipe(v.string(), v.trim(), v.nonEmpty())
export const trimmedEmail = v.pipe(trimmedString, v.email())
const NameTuple = v.tuple([trimmedString, trimmedString])
const EmailTuple = v.tuple([trimmedEmail, trimmedEmail])

/**
 * Represents a mapping of proper names to deadnames.
 * Each tuple represents one mapping of a proper name to a deadname.
 * @example
 * ["jack", "jackie"]  // deadname, properName
 */
export type NameTuple = v.InferOutput<typeof NameTuple | typeof EmailTuple>

const NameEntry = v.object({
  mappings: NameTuple,
})
const EmailEntry = v.object({
  mappings: EmailTuple,
})

export type NameEntry = v.InferOutput<typeof NameEntry>
export type EmailEntry = v.InferOutput<typeof EmailEntry>

export interface Names {
  first: NameEntry[]
  middle: NameEntry[]
  last: NameEntry[]
  email: EmailEntry[]
}

export const themes = [{
  label: 'Trans',
  value: 'trans',
}, {
  label: 'Non-Binary',
  value: 'non-binary',
}, {
  label: 'High Contrast (Yellow)',
  value: 'high-contrast',
}] as const

export const UserSettings = v.object({
  names: v.pipe(
    v.object({
      first: v.array(NameEntry),
      middle: v.array(NameEntry),
      last: v.array(NameEntry),
      email: v.array(EmailEntry),
    }),
    v.check(validateNoDuplicateDeadnames, 'Duplicate deadnames found'),
    v.check(validateNoSelfMappings, 'Self mappings found'),
    v.check(validateNoRecursiveMappings, 'Recursive mappings found'),
  ),
  enabled: v.boolean(),
  stealthMode: v.boolean(),
  blockContentBeforeDone: v.boolean(),
  highlightReplacedNames: v.boolean(),
  syncSettingsAcrossDevices: v.boolean(),
  theme: v.union(themes.map(x => v.literal(x.value))),
})

export type UserSettings = v.InferOutput<typeof UserSettings>

export type ReplacementsMap = Map<RegExp, string>
