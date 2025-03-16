import { UserSettings } from '@/utils/types'

export const defaultSettings: UserSettings = {
  names: {
    first: [],
    middle: [],
    last: [],
  },
  enabled: true,
  blockContentBeforeDone: true,
  stealthMode: false,
  hideDebugInfo: false,
  highlightReplacedNames: true,
  syncSettingsAcrossDevices: false,
  theme: 'trans',
}
