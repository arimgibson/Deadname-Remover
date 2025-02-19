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
] as const

export const generalSettingKeys = [
  {
    label: 'Enable Extension',
    value: 'enabled',
    description: 'Enable or disable the extension\'s name replacement functionality.',
  },
  {
    label: 'Stealth Mode',
    value: 'stealthMode',
    description:
      'Hide gender-related elements to protect privacy and accidentally being outed. Disables text highlighting, replaces the extension icon, and hides the popup options when the extension\'s icon is clicked.',
  },
  {
    label: 'Block Page Until Replacements Finished',
    value: 'blockContentBeforeDone',
    description:
      'Block the page until all replacements are finished to avoid displaying a deadname before replacement. Can cause slowdowns on lower-end devices.',
  },
  {
    label: 'Highlight Replaced Names',
    value: 'highlightReplacedNames',
    description: 'Highlight replaced names to make them easier to spot.',
  },
  {
    label: 'Sync Settings Across Devices',
    value: 'syncSettingsAcrossDevices',
    description: 'Sync settings across devices signed into the same browser profile (e.g. Google account).',
  },
] as const

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
