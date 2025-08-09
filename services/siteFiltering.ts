import type { UserSettings, ParsingStatus } from '@/utils/types'
import { storage } from '#imports'

export class SiteFiltering {
  private readonly ALLOWLIST_KEY = 'local:allowlist'
  private readonly BLOCKLIST_KEY = 'local:blocklist'
  private readonly PARSING_STATUS_KEY = 'local:parsingStatus'

  async getAllowlist(): Promise<string[]> {
    const allowlist = await storage.getItem<string[]>(this.ALLOWLIST_KEY)
    return allowlist ?? []
  }

  async getBlocklist(): Promise<string[]> {
    const blocklist = await storage.getItem<string[]>(this.BLOCKLIST_KEY)
    return blocklist ?? []
  }

  /**
   * Gets the parsing status from local storage
   * @returns The parsing status
   */
  async getParsingStatus(): Promise<ParsingStatus | null> {
    return await storage.getItem<ParsingStatus>(this.PARSING_STATUS_KEY)
  }

  /**
   * Updates the parsing status in local storage
   * @param status - The status to update
   */
  async updateParsingStatus({
    status,
    hostname,
    theme,
  }: {
    status: Omit<ParsingStatus, 'site' | 'timestamp'>
    hostname: string
    theme: UserSettings['theme']
  }) {
    await storage.setItem<ParsingStatus>(this.PARSING_STATUS_KEY, {
      ...status,
      site: hostname,
      timestamp: Date.now(),
    })
    await browser.runtime.sendMessage({
      type: 'PARSING_STATUS_CHANGE',
      data: {
        status: {
          ...status,
          site: hostname,
          timestamp: Date.now(),
        },
        theme,
      },
    })
  }

  /**
   * Sets up a listener for changes to the parsing status in local storage
   * @param callback - The callback to call when the parsing status changes
   */
  setupParsingStatusListener(callback: (status: ParsingStatus | null) => void) {
    storage.watch(this.PARSING_STATUS_KEY, callback)
  }

  /**
* Finds the most specific (longest) matching prefix from a list of strings against a target site.
*
* This function is used to determine the best matching entry from allowlist/blocklist configurations
* by comparing URL patterns. It returns the entry with the longest matching prefix, which represents
* the most specific match. Unlike simple startsWith matching, this respects domain and path boundaries
* and supports wildcard patterns with *.
*
* @param list - Array of string patterns to match against (e.g., allowlist/blocklist entries)
* @param site - The target site string to match (typically a URL or path)
* @returns The longest matching prefix from the list, or null if no matches are found
*
* @example
* ```typescript
* const allowlist = ['example.com', 'example.com/admin*', 'example.com/user']
* const site = 'example.com/admin/dashboard'
* const match = getMostSpecificMatch(allowlist, site)
* // Returns: 'example.com/admin*' (longest matching prefix with wildcard support)
* ```
*/
  private getMostSpecificMatch(list: string[], site: string): string | null {
    const matches = list.filter(entry => this.matchesPattern(entry, site))

    if (matches.length === 0) return null

    // Return the longest matching pattern (most specific)
    return matches.reduce((a, b) => (b.length > a.length ? b : a))
  }

  /**
   * Checks if a site matches a pattern (with optional wildcards).
   *
   * @param pattern - The pattern to match (e.g., "google.com/ma*", "*.google.com")
   * @param site - The site to match against
   * @returns true if the site matches the pattern
   */
  private matchesPattern(pattern: string, site: string): boolean {
    // Handle wildcard patterns by converting to regex
    if (pattern.includes('*')) {
      return this.matchesWildcardPattern(pattern, site)
    }

    // Handle exact patterns with boundary checking
    return this.matchesExactPattern(pattern, site)
  }

  /**
   * Checks if a site matches a wildcard pattern by converting it to a regex.
   */
  private matchesWildcardPattern(pattern: string, site: string): boolean {
    // Escape regex special characters except *
    const escapedPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/?#]*') // * matches any chars except URL separators

    // Add boundary checking: pattern must be followed by separator, query, fragment, or end
    const regex = new RegExp(`^${escapedPattern}(?:[/?#]|$)`)
    return regex.test(site)
  }

  /**
   * Checks if a site matches an exact pattern with boundary checking.
   */
  private matchesExactPattern(pattern: string, site: string): boolean {
    // Exact match
    if (pattern === site) return true

    // Must start with pattern
    if (!site.startsWith(pattern)) return false

    // Check boundary: next character must be separator, query, fragment, or end
    const nextChar = site[pattern.length]
    return !nextChar || nextChar === '/' || nextChar === '?' || nextChar === '#'
  }

  /**
 * Determines whether name replacement should be performed on the current site based on allowlist/blocklist configuration.
 *
 * This function evaluates the current URL against the user's allowlist and blocklist settings to decide
 * if the deadname remover should process the page. It uses a priority system where more specific matches
 * (longer prefixes) take precedence over less specific ones.
 *
 * @param obj.config - Configuration object containing user settings, including allowlist, blocklist, and defaultAllowMode
 * @returns Object containing the decision and details about which items influenced it
 *
 * @example
 * ```typescript
 * const config = {
 *   allowlist: ['example.com/admin'],
 *   blocklist: ['example.com'],
 *   defaultAllowMode: true
 * }
 * const result = shouldParseSite({ config })
 * // Returns: { shouldParse: true, allowMatch: 'example.com/admin', blockMatch: 'example.com', reason: 'allowlist_more_specific' }
 * ```
 */
  shouldParseSite({ config }: { config: UserSettings }): {
    shouldParse: boolean
    allowMatch: string | null
    blockMatch: string | null
    reason: 'extension_disabled' | 'blocked_by_blocklist' | 'allowed_by_allowlist' | 'blocked_by_default' | 'enabled'
  } {
    const { hostname, pathname } = window.location
    const fullUrl = `${hostname.replace(/^www\./, '')}${pathname}`
    const allowMatch = this.getMostSpecificMatch(config.allowlist, fullUrl)
    const blockMatch = this.getMostSpecificMatch(config.blocklist, fullUrl)

    if (config.defaultAllowMode) {
      if (!blockMatch) {
        return {
          shouldParse: true,
          allowMatch,
          blockMatch,
          reason: 'enabled',
        }
      }
      if (!allowMatch) {
        return {
          shouldParse: false,
          allowMatch,
          blockMatch,
          reason: 'blocked_by_blocklist',
        }
      }

      const shouldParse = allowMatch.length >= blockMatch.length
      return {
        shouldParse,
        allowMatch,
        blockMatch,
        reason: shouldParse ? 'allowed_by_allowlist' : 'blocked_by_blocklist',
      }
    }
    else {
      if (!allowMatch) {
        return {
          shouldParse: false,
          allowMatch,
          blockMatch,
          reason: 'blocked_by_default',
        }
      }
      if (!blockMatch) {
        return {
          shouldParse: true,
          allowMatch,
          blockMatch,
          reason: 'allowed_by_allowlist',
        }
      }

      const shouldParse = allowMatch.length >= blockMatch.length
      return {
        shouldParse,
        allowMatch,
        blockMatch,
        reason: shouldParse ? 'allowed_by_allowlist' : 'blocked_by_blocklist',
      }
    }
  }
}
