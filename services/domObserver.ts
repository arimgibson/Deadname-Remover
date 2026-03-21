import { TextProcessor } from './textProcessor'

export class DOMObserver {
  private observer: MutationObserver | null = null
  private textProcessor: TextProcessor

  constructor(textProcessor: TextProcessor) {
    this.textProcessor = textProcessor
  }

  setup(replacements: Map<RegExp, string>): void {
    // Clean up any existing observer
    this.disconnect()

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
      }
      if (pendingRoots.size > 0 && !scheduled) {
        const observerForThisFlush = this.observer
        if (!observerForThisFlush) {
          return
        }
        scheduled = true
        void requestAnimationFrame(() => {
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
              void this.textProcessor.processSubtree(root, replacements, false)
            }
          }
          finally {
            observerForThisFlush.observe(document.body, {
              childList: true,
              subtree: true,
            })
          }
        })
      }
    })

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}
