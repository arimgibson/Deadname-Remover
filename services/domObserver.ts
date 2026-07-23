import { TextProcessor } from './textProcessor'

const scheduleIdle: (cb: () => void) => void
  = typeof requestIdleCallback === 'function'
    ? cb => requestIdleCallback(cb, { timeout: 100 })
    : cb => setTimeout(cb, 0)

/** Shared so reconnect cannot drift from the initial observe() config */
const OBSERVE_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
  characterData: true,
}

export class DOMObserver {
  private observer: MutationObserver | null = null
  private textProcessor: TextProcessor

  constructor(textProcessor: TextProcessor) {
    this.textProcessor = textProcessor
  }

  private matchesQuickCheck(text: string, quickCheck: RegExp): boolean {
    quickCheck.lastIndex = 0
    return quickCheck.test(text)
  }

  private hasAnyMatch(root: HTMLElement, quickCheck: RegExp): boolean {
    const text = root.textContent
    if (text && this.matchesQuickCheck(text, quickCheck)) return true

    // Check the root element itself (querySelectorAll only searches descendants)
    for (const attr of TextProcessor.accessibilityAttributes) {
      const value = root.getAttribute(attr)
      if (value && this.matchesQuickCheck(value, quickCheck)) return true
    }

    const selector = TextProcessor.accessibilityAttributes
      .map(attr => `[${attr}]`)
      .join(',')
    const nodes = root.querySelectorAll(selector)
    for (const el of nodes) {
      for (const attr of TextProcessor.accessibilityAttributes) {
        const value = el.getAttribute(attr)
        if (value && this.matchesQuickCheck(value, quickCheck)) return true
      }
    }
    return false
  }

  /**
   * characterData updates are small but high volume, run quick check
   * on content before adding overhead of enqueuing
   */
  private shouldEnqueueCharacterData(
    mutation: MutationRecord,
    quickCheck: RegExp | null,
  ): HTMLElement | null {
    if (!quickCheck) return null
    if (mutation.target.nodeType !== Node.TEXT_NODE) return null

    const textNode = mutation.target as Text
    const parent = textNode.parentElement
    if (!parent) return null

    const value = textNode.nodeValue
    if (!value) return null

    if (!this.matchesQuickCheck(value, quickCheck)) return null

    return parent
  }

  setup(replacements: Map<RegExp, string>): void {
    // Clean up any existing observer
    this.disconnect()

    const quickCheckSources: string[] = []
    for (const pattern of replacements.keys()) {
      // Strip Unicode word boundary lookaround for fast pre-check
      const core = pattern.source
        .replace(/^\(\?<!\\p\{L\}\)/, '')
        .replace(/\(\?!\\p\{L\}\)$/, '')
      quickCheckSources.push(core)
    }
    const quickCheck = quickCheckSources.length > 0
      ? new RegExp(quickCheckSources.join('|'), 'iu')
      : null

    const pendingRoots = new Set<HTMLElement>()
    let scheduled = false

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              pendingRoots.add(node)
            }
            else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
              // Process the parent element if needed.
              pendingRoots.add(node.parentElement)
            }
          })
        }
        else if (mutation.type === 'characterData') {
          const parent = this.shouldEnqueueCharacterData(mutation, quickCheck)
          if (parent) pendingRoots.add(parent)
        }
      }
      if (pendingRoots.size > 0 && !scheduled) {
        const observerForThisFlush = this.observer
        if (!observerForThisFlush) {
          return
        }
        scheduled = true
        scheduleIdle(() => {
          if (this.observer !== observerForThisFlush) {
            pendingRoots.clear()
            scheduled = false
            return
          }

          const rootsArray = Array.from(pendingRoots)
          pendingRoots.clear()
          scheduled = false

          const deduped = rootsArray.filter(root =>
            !rootsArray.some(other => other !== root && other.contains(root)),
          )

          observerForThisFlush.disconnect()
          try {
            for (const root of deduped) {
              if (!quickCheck || this.hasAnyMatch(root, quickCheck)) {
                void this.textProcessor.processSubtree(root, replacements, false)
              }
            }
          }
          finally {
            observerForThisFlush.observe(document.body, OBSERVE_OPTIONS)
          }
        })
      }
    })

    this.observer.observe(document.body, OBSERVE_OPTIONS)
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}
