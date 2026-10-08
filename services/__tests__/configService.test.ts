import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { defaultSettings, getConfig, setConfig } from '../configService'

describe('setConfig', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it.each(['allowlist', 'blocklist'] as const)('should save localhost in the %s', async (list) => {
    const settings = { ...defaultSettings, [list]: ['localhost'] }

    await setConfig(settings)

    expect(await getConfig()).toEqual(settings)
  })
})
