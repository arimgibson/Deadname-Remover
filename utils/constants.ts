import type { SettingsKey } from '@/utils/types'

export const nameKeys = [
  {
    label: 'First Names',
    value: 'first',
  },
  {
    label: 'Middle Names',
    value: 'middle',
  },
  {
    label: 'Last Names',
    value: 'last',
  },
  {
    label: 'Email Addresses',
    value: 'email',
  },
] as const

export const generalSettingKeys = [
  {
    label: 'Enable Extension',
    value: 'enabled',
    advanced: false,
    description: 'Enable or disable the extension\'s name replacement functionality.',
  },
  {
    label: 'Stealth Mode',
    value: 'stealthMode',
    advanced: false,
    description:
      'Hide gender-related elements to protect privacy and accidentally being outed. Replaces the extension icon, and hides the popup options when the extension\'s icon is clicked. Recommended to disable text highlighting as well.',
  },
  {
    label: 'Hide Debug Info',
    value: 'hideDebugInfo',
    advanced: true,
    description:
      'Hide debug information from the browser console. This can help protect your privacy by not exposing potentially sensitive information.',
  },
  {
    label: 'Block Page Until Replacements Finished',
    value: 'blockContentBeforeDone',
    advanced: false,
    description:
      'Block the page until all replacements are finished to avoid displaying a deadname before replacement. Can cause slowdowns on lower-end devices.',
  },
  {
    label: 'Highlight Replaced Names',
    value: 'highlightReplacedNames',
    advanced: false,
    description: 'Highlight replaced names to make them easier to spot.',
  },
  {
    label: 'Sync Settings Across Devices',
    value: 'syncSettingsAcrossDevices',
    advanced: false,
    description: 'Sync settings across devices signed into the same browser profile (e.g. Google account).',
  },
] as const satisfies SettingsKey[]

export const siteFilteringSettingKeys = [
  {
    label: 'Default Allow All Sites',
    value: 'defaultAllowMode',
    advanced: false,
    description: 'When enabled, the extension will replace names on all sites by default, except those in the blocklist. When disabled, it will only replace names on sites in the allowlist.',
  },
] as const satisfies SettingsKey[]

export const themeKeys = [
  {
    label: 'Trans',
    value: 'trans',
  },
  {
    label: 'Non-Binary',
    value: 'non-binary',
  },
  {
    label: 'High Contrast (Yellow)',
    value: 'high-contrast',
  },
] as const
