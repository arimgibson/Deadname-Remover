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

    const processChanges = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.textProcessor.processSubtree(node, replacements, 10)
            }
            else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
              // Process the parent element if needed.
              this.textProcessor.processSubtree(node.parentElement, replacements, 10)
            }
          })
        }
        else if (mutation.type === 'characterData') {
          // For text changes, we still need to process the parent element
          // to ensure we catch all related changes
          const parentElement = mutation.target.parentElement
          if (parentElement) {
            this.textProcessor.processSubtree(parentElement, replacements, 10)
          }
        }
      }
    }

    let mutationQueue: MutationRecord[] = []
    let queued = false

    const processQueuedMutations = () => {
      // Process all queued mutations at once
      processChanges(mutationQueue)
      mutationQueue = []
      queued = false
    }

    this.observer = new MutationObserver((mutations) => {
      mutationQueue.push(...mutations)
      if (!queued) {
        queued = true
        requestAnimationFrame(processQueuedMutations)
      }
    })

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}
