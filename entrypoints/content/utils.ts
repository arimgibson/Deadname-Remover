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
