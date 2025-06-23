import { createReplacementPattern } from '@/services/textProcessor'
import { debugLog, kebabToCamel } from '@/utils'
import type { Names, ReplacementsMap, NameEntry, UserSettings } from '@/utils/types'

export async function waitUntilDOMReady() {
  if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
    await debugLog('waiting for DOM to be ready')
    await new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', resolve, { once: true })
    })
    await debugLog('DOM is ready')
  }
}

export function blockContent() {
  if (document.getElementById('deadname-remover-blocker')) return

  // Despite what TypeScript thinks, sometimes these aren't available which causes
  // the extension to err out at this step and not replace names.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  document.documentElement?.classList.add('deadname-remover-not-ready')
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  document.body?.classList.add('deadname-remover-not-ready')

  const style = document.createElement('style')
  style.id = 'deadname-remover-blocker'
  style.textContent = `
    html.deadname-remover-not-ready, body.deadname-remover-not-ready {
      visibility: hidden !important;
    }
  `
  document.head.appendChild(style)
}

export function unblockContent() {
  document.documentElement.classList.remove('deadname-remover-not-ready')
  document.body.classList.remove('deadname-remover-not-ready')
  document.getElementById('deadname-remover-blocker')?.remove()
}

export function createReplacementsMap(names: Names): ReplacementsMap {
  const replacements: ReplacementsMap = new Map<RegExp, string>()
  Object.values(names).forEach((nameArray: NameEntry[]) => {
    nameArray.forEach(({ mappings }) => {
      replacements.set(createReplacementPattern(mappings[0]), mappings[1])
    })
  })
  return replacements
}

export function setStyle({
  document,
  theme,
  highlight,
}: {
  document: Document
  theme: UserSettings['theme']
  highlight: boolean
}): void {
  document.querySelector('style[deadname]')?.remove()

  const backgroundStyling = {
    'non-binary': 'linear-gradient(90deg, rgb(255, 244, 48) 0%, white 25%, rgb(156, 89, 209) 50%, white 75%, rgb(255, 244, 48) 100%)',
    'trans': 'linear-gradient(90deg, rgba(85,205,252) 0%, rgb(247,168,184) 25%, white 50%, rgb(247,168,184) 75%, rgb(85,205,252) 100%)',
    'high-contrast': 'yellow',
  } as const

  const style: Element = document.createElement('style')
  style.setAttribute('deadname', '')
  document.head.appendChild(style)

  // Add CSS rules directly to the style element
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sheet = (style as HTMLStyleElement).sheet!
  sheet.insertRule(`
    /* Styling for the Ari's Deadname Remover extension. Selection based on attribute to avoid styling conflicts based on class. */
    mark[deadname] {
      background: ${highlight ? backgroundStyling[theme] : 'none'};
      color: ${highlight ? 'black' : 'inherit'};
    }
  `)
}

/**
 * Converts a kebab-cased attribute name into camelCase format,
 * prefixing it with 'deadname-' to create a data key.
 *
 * @param {string} attr - The attribute name in kebab-case.
 * @returns {string} The converted data key in camelCase.
 */
export function getDataKey(attr: string): string {
  return kebabToCamel(`deadname-${attr}`)
}

/**
 * Finds the most specific (longest) matching prefix from a list of strings against a target site.
 *
 * This function is used to determine the best matching entry from allowlist/blocklist configurations
 * by comparing URL patterns. It returns the entry with the longest matching prefix, which represents
 * the most specific match.
 *
 * @param list - Array of string patterns to match against (e.g., allowlist/blocklist entries)
 * @param site - The target site string to match (typically a URL or path)
 * @returns The longest matching prefix from the list, or null if no matches are found
 *
 * @example
 * ```typescript
 * const allowlist = ['example.com', 'example.com/admin', 'example.com/user']
 * const site = 'example.com/admin/dashboard'
 * const match = getMostSpecificMatch(allowlist, site)
 * // Returns: 'example.com/admin' (longest matching prefix)
 * ```
 */
function getMostSpecificMatch(list: string[], site: string): string | null {
  // Return the longest matching prefix
  const matches = list.filter(entry => site.startsWith(entry))
  if (matches.length === 0) return null
  return matches.reduce((a, b) => (b.length > a.length ? b : a))
}

/**
 * Determines whether name replacement should be performed on the current site based on allowlist/blocklist configuration.
 *
 * This function evaluates the current URL against the user's allowlist and blocklist settings to decide
 * if the deadname remover should process the page. It uses a priority system where more specific matches
 * (longer prefixes) take precedence over less specific ones.
 *
 * @param obj.config - Configuration object containing user settings, including allowlist, blocklist, and defaultAllowMode
 * @returns true if the site should be parsed for name replacement, false otherwise
 *
 * @example
 * ```typescript
 * const config = {
 *   allowlist: ['example.com/admin'],
 *   blocklist: ['example.com'],
 *   defaultAllowMode: true
 * }
 * const shouldParse = shouldParseSite({ config })
 * // Returns: true (allowlist match is more specific than blocklist match)
 * ```
 */
export function shouldParseSite({ config }: { config: UserSettings }) {
  const { hostname, pathname } = window.location
  const fullUrl = `${hostname.replace(/^www\./, '')}${pathname}`
  const allowMatch = getMostSpecificMatch(config.allowlist, fullUrl)
  const blockMatch = getMostSpecificMatch(config.blocklist, fullUrl)

  if (config.defaultAllowMode) {
    if (!blockMatch) return true
    if (!allowMatch) return false

    return allowMatch.length >= blockMatch.length
  }
  else {
    if (!allowMatch) return false
    if (!blockMatch) return true

    return allowMatch.length >= blockMatch.length
  }
}
