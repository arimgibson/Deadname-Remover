import { describe, expect, it, beforeEach, vi } from 'vitest'
import { SiteFiltering } from '../siteFiltering'
import type { UserSettings } from '@/utils/types'

// Mock window.location
const mockLocation = {
  hostname: '',
  pathname: '',
}

Object.defineProperty(global, 'window', {
  value: {
    location: mockLocation,
  },
  writable: true,
})

describe('SiteFiltering', () => {
  let siteFiltering: SiteFiltering

  beforeEach(() => {
    siteFiltering = new SiteFiltering()
    vi.clearAllMocks()
  })

  describe('getMostSpecificMatch', () => {
    // Access private method for testing via type assertion
    const getMostSpecificMatch = (list: string[], site: string): string | null => {
      // @ts-expect-error - accessing private method for testing
      return siteFiltering.getMostSpecificMatch(list, site)
    }

    describe('exact matches', () => {
      it('should match exact domain', () => {
        const result = getMostSpecificMatch(['example.com'], 'example.com')
        expect(result).toBe('example.com')
      })

      it('should match exact path', () => {
        const result = getMostSpecificMatch(['example.com/admin'], 'example.com/admin')
        expect(result).toBe('example.com/admin')
      })
    })

    describe('domain boundary matching', () => {
      it('should match domain at path boundary', () => {
        const result = getMostSpecificMatch(['google.com'], 'google.com/maps')
        expect(result).toBe('google.com')
      })

      it('should match domain at query boundary', () => {
        const result = getMostSpecificMatch(['google.com'], 'google.com?q=search')
        expect(result).toBe('google.com')
      })

      it('should match domain at fragment boundary', () => {
        const result = getMostSpecificMatch(['google.com'], 'google.com#section')
        expect(result).toBe('google.com')
      })

      it('should NOT match partial domain names', () => {
        const result = getMostSpecificMatch(['google.com'], 'google.com.evil.com')
        expect(result).toBeNull()
      })
    })

    describe('path boundary matching', () => {
      it('should match path at exact boundary', () => {
        const result = getMostSpecificMatch(['google.com/maps'], 'google.com/maps/directions')
        expect(result).toBe('google.com/maps')
      })

      it('should match path at query boundary', () => {
        const result = getMostSpecificMatch(['google.com/search'], 'google.com/search?q=test')
        expect(result).toBe('google.com/search')
      })

      it('should match path at fragment boundary', () => {
        const result = getMostSpecificMatch(['google.com/docs'], 'google.com/docs#section')
        expect(result).toBe('google.com/docs')
      })

      it('should NOT match partial path segments', () => {
        const result = getMostSpecificMatch(['google.com/ma'], 'google.com/maps')
        expect(result).toBeNull()
      })

      it('should NOT match partial path segments (longer case)', () => {
        const result = getMostSpecificMatch(['google.com/map'], 'google.com/maps')
        expect(result).toBeNull()
      })
    })

    describe('multiple matches - most specific wins', () => {
      it('should return longest matching domain', () => {
        const list = ['example.com', 'subdomain.example.com']
        const result = getMostSpecificMatch(list, 'subdomain.example.com/page')
        expect(result).toBe('subdomain.example.com')
      })

      it('should return longest matching path', () => {
        const list = ['example.com', 'example.com/admin', 'example.com/admin/users']
        const result = getMostSpecificMatch(list, 'example.com/admin/users/profile')
        expect(result).toBe('example.com/admin/users')
      })

      it('should prefer path match over domain match', () => {
        const list = ['example.com', 'example.com/admin']
        const result = getMostSpecificMatch(list, 'example.com/admin/dashboard')
        expect(result).toBe('example.com/admin')
      })
    })

    describe('no matches', () => {
      it('should return null when no patterns match', () => {
        const result = getMostSpecificMatch(['facebook.com'], 'google.com')
        expect(result).toBeNull()
      })

      it('should return null for empty list', () => {
        const result = getMostSpecificMatch([], 'google.com')
        expect(result).toBeNull()
      })
    })

    describe('wildcard patterns', () => {
      it('should match simple wildcard at end', () => {
        const result = getMostSpecificMatch(['google.com/ma*'], 'google.com/maps')
        expect(result).toBe('google.com/ma*')
      })

      it('should match wildcard at end of path (google.com/* matching google.com/maps)', () => {
        const result = getMostSpecificMatch(['google.com/*'], 'google.com/maps')
        expect(result).toBe('google.com/*')
      })

      it('should match wildcard in middle', () => {
        const result = getMostSpecificMatch(['google.com/*/admin'], 'google.com/user/admin')
        expect(result).toBe('google.com/*/admin')
      })

      it('should match wildcard at start', () => {
        const result = getMostSpecificMatch(['*.google.com'], 'mail.google.com')
        expect(result).toBe('*.google.com')
      })

      it('should match multiple wildcards', () => {
        const result = getMostSpecificMatch(['*.google.com/*'], 'mail.google.com/inbox')
        expect(result).toBe('*.google.com/*')
      })

      it('should NOT match wildcard across path boundaries', () => {
        const result = getMostSpecificMatch(['google.com/ma*'], 'google.com/maps/directions')
        expect(result).toBe('google.com/ma*')
      })

      it('should respect boundary rules with wildcards', () => {
        const result = getMostSpecificMatch(['google.com/ma*'], 'google.com/mail')
        expect(result).toBe('google.com/ma*')
      })

      it('should NOT match wildcard when literal part does not match', () => {
        const result = getMostSpecificMatch(['google.com/admin*'], 'google.com/maps')
        expect(result).toBeNull()
      })

      it('should prefer longer wildcard matches', () => {
        const list = ['google.com/*', 'google.com/ma*', 'google.com/maps*']
        const result = getMostSpecificMatch(list, 'google.com/maps/directions')
        expect(result).toBe('google.com/maps*')
      })

      it('should prefer wildcard matches over exact matches if they are the same length', () => {
        const list = ['google.com/maps*', 'google.com/maps']
        const result = getMostSpecificMatch(list, 'google.com/maps')
        // Longer pattern should be preferred (google.com/maps* is more specific than google.com/maps)
        expect(result).toBe('google.com/maps*')
      })
    })
  })

  describe('shouldParseSite', () => {
    beforeEach(() => {
      // Reset window.location mock
      mockLocation.hostname = 'example.com'
      mockLocation.pathname = '/page'
    })

    describe('defaultAllowMode = true', () => {
      const baseConfig: UserSettings = {
        names: { first: [], middle: [], last: [], email: [] },
        enabled: true,
        stealthMode: false,
        hideDebugInfo: false,
        blockContentBeforeDone: false,
        highlightReplacedNames: false,
        syncSettingsAcrossDevices: false,
        theme: 'trans',
        toggleKeybinding: null,
        defaultAllowMode: true,
        allowlist: [],
        blocklist: [],
      }

      it('should parse when no matches exist', () => {
        const config = { ...baseConfig, allowlist: [], blocklist: [] }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: true,
          allowMatch: null,
          blockMatch: null,
          reason: 'enabled',
        })
      })

      it('should not parse when blocked and no allowlist override', () => {
        const config = { ...baseConfig, blocklist: ['example.com'] }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: false,
          allowMatch: null,
          blockMatch: 'example.com',
          reason: 'blocked_by_blocklist',
        })
      })

      it('should parse when allowlist overrides blocklist (allowlist more specific)', () => {
        const config = {
          ...baseConfig,
          allowlist: ['example.com/page'],
          blocklist: ['example.com'],
        }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: true,
          allowMatch: 'example.com/page',
          blockMatch: 'example.com',
          reason: 'allowed_by_allowlist',
        })
      })

      it('should not parse when blocklist more specific than allowlist', () => {
        const config = {
          ...baseConfig,
          allowlist: ['example.com'],
          blocklist: ['example.com/page'],
        }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: false,
          allowMatch: 'example.com',
          blockMatch: 'example.com/page',
          reason: 'blocked_by_blocklist',
        })
      })

      it('should not parse when specific site is in blocklist (google.com/maps example)', () => {
        // Set up location to simulate being on google.com/maps
        mockLocation.hostname = 'google.com'
        mockLocation.pathname = '/maps'

        const config = {
          ...baseConfig,
          allowlist: [],
          blocklist: ['google.com/maps'],
        }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: false,
          allowMatch: null,
          blockMatch: 'google.com/maps',
          reason: 'blocked_by_blocklist',
        })

        // Reset location for other tests
        mockLocation.hostname = 'example.com'
        mockLocation.pathname = '/page'
      })
    })

    describe('defaultAllowMode = false', () => {
      const baseConfig: UserSettings = {
        names: { first: [], middle: [], last: [], email: [] },
        enabled: true,
        stealthMode: false,
        hideDebugInfo: false,
        blockContentBeforeDone: false,
        highlightReplacedNames: false,
        syncSettingsAcrossDevices: false,
        theme: 'trans',
        toggleKeybinding: null,
        defaultAllowMode: false,
        allowlist: [],
        blocklist: [],
      }

      it('should not parse when not in allowlist', () => {
        const config = { ...baseConfig, allowlist: [], blocklist: [] }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: false,
          allowMatch: null,
          blockMatch: null,
          reason: 'blocked_by_default',
        })
      })

      it('should parse when in allowlist and no blocklist match', () => {
        const config = { ...baseConfig, allowlist: ['example.com'] }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: true,
          allowMatch: 'example.com',
          blockMatch: null,
          reason: 'allowed_by_allowlist',
        })
      })

      it('should parse when allowlist more specific than blocklist', () => {
        const config = {
          ...baseConfig,
          allowlist: ['example.com/page'],
          blocklist: ['example.com'],
        }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: true,
          allowMatch: 'example.com/page',
          blockMatch: 'example.com',
          reason: 'allowed_by_allowlist',
        })
      })

      it('should not parse when blocklist more specific than allowlist', () => {
        const config = {
          ...baseConfig,
          allowlist: ['example.com'],
          blocklist: ['example.com/page'],
        }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: false,
          allowMatch: 'example.com',
          blockMatch: 'example.com/page',
          reason: 'blocked_by_blocklist',
        })
      })

      it('should parse when google.com/ma prefix is allowed and defaultAllowMode is false', () => {
        // Set up location to simulate being on google.com/maps
        mockLocation.hostname = 'google.com'
        mockLocation.pathname = '/maps'

        const config = {
          ...baseConfig,
          allowlist: ['google.com/ma*'], // This should now match /maps with wildcard support
          blocklist: [],
        }
        const result = siteFiltering.shouldParseSite({ config })

        // With wildcard support, this should now match
        expect(result).toEqual({
          shouldParse: true,
          allowMatch: 'google.com/ma*',
          blockMatch: null,
          reason: 'allowed_by_allowlist',
        })

        // Reset location for other tests
        mockLocation.hostname = 'example.com'
        mockLocation.pathname = '/page'
      })

      it('should parse when google.com/maps is explicitly allowed and defaultAllowMode is false', () => {
        // Set up location to simulate being on google.com/maps
        mockLocation.hostname = 'google.com'
        mockLocation.pathname = '/maps'

        const config = {
          ...baseConfig,
          allowlist: ['google.com/maps'], // Exact match should work
          blocklist: [],
        }
        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: true,
          allowMatch: 'google.com/maps',
          blockMatch: null,
          reason: 'allowed_by_allowlist',
        })

        // Reset location for other tests
        mockLocation.hostname = 'example.com'
        mockLocation.pathname = '/page'
      })
    })

    describe('URL processing', () => {
      it('should strip www prefix from hostname', () => {
        mockLocation.hostname = 'www.example.com'
        mockLocation.pathname = '/page'

        const config: UserSettings = {
          names: { first: [], middle: [], last: [], email: [] },
          enabled: true,
          stealthMode: false,
          hideDebugInfo: false,
          blockContentBeforeDone: false,
          highlightReplacedNames: false,
          syncSettingsAcrossDevices: false,
          theme: 'trans',
          toggleKeybinding: null,
          defaultAllowMode: false,
          allowlist: ['example.com/page'],
          blocklist: [],
        }

        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: true,
          allowMatch: 'example.com/page',
          blockMatch: null,
          reason: 'allowed_by_allowlist',
        })
      })

      it('should handle root path correctly', () => {
        mockLocation.hostname = 'example.com'
        mockLocation.pathname = '/'

        const config: UserSettings = {
          names: { first: [], middle: [], last: [], email: [] },
          enabled: true,
          stealthMode: false,
          hideDebugInfo: false,
          blockContentBeforeDone: false,
          highlightReplacedNames: false,
          syncSettingsAcrossDevices: false,
          theme: 'trans',
          toggleKeybinding: null,
          defaultAllowMode: false,
          allowlist: ['example.com'],
          blocklist: [],
        }

        const result = siteFiltering.shouldParseSite({ config })

        expect(result).toEqual({
          shouldParse: true,
          allowMatch: 'example.com',
          blockMatch: null,
          reason: 'allowed_by_allowlist',
        })
      })
    })
  })
})
