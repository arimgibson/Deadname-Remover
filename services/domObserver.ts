import { TextProcessor } from './textProcessor'

export class DOMObserver {
  private observer: MutationObserver | null = null
  private textProcessor: TextProcessor
  /** Maximum depth for DOM traversal to prevent excessive processing on deeply nested structures */
  private static readonly MAX_PROCESSING_DEPTH = 10

  // Debouncing properties
  private pendingNodes = new Set<Node>()
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private readonly DEBOUNCE_DELAY = 48 // ~3 frames for responsiveness

  constructor(textProcessor: TextProcessor) {
    this.textProcessor = textProcessor
  }

  setup(replacements: Map<RegExp, string>): void {
    // Clean up any existing observer
    this.disconnect()

    this.observer = new MutationObserver((mutations) => {
      // Collect affected nodes using fastest loops
      const nodesToAdd: Node[] = []

      // Use traditional for loop for best performance
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i]

        if (mutation.type === 'childList') {
          // Process added nodes
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const node = mutation.addedNodes[j]

            if (node instanceof HTMLElement) {
              // Only add nodes that might contain processable content
              if (this.shouldProcessElement(node)) {
                nodesToAdd.push(node)
              }
            }
            else if (node.nodeType === Node.TEXT_NODE) {
              // Check if text node has meaningful content
              const textContent = node.nodeValue?.trim()
              if (textContent && textContent.length > 0) {
                nodesToAdd.push(node)
              }
            }
          }
        }
        else if (mutation.type === 'characterData') {
          // Only process meaningful text changes
          const textContent = (mutation.target as Text).nodeValue?.trim()
          if (textContent && textContent.length > 0) {
            nodesToAdd.push(mutation.target)
          }
        }
      }

      // Schedule debounced processing
      if (nodesToAdd.length > 0) {
        this.scheduleProcessing(nodesToAdd, replacements)
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

    // Clear any pending debounced processing
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    this.pendingNodes.clear()
  }

  private scheduleProcessing(newNodes: Node[], replacements: Map<RegExp, string>): void {
    // Add nodes to pending set (automatic deduplication)
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < newNodes.length; i++) {
      this.pendingNodes.add(newNodes[i])
    }

    // Reset debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.processPendingNodes(replacements)
      this.pendingNodes.clear()
      this.debounceTimer = null
    }, this.DEBOUNCE_DELAY)
  }

  private processPendingNodes(replacements: Map<RegExp, string>): void {
    // Convert Set to Array for faster iteration
    const nodes = Array.from(this.pendingNodes)

    // Process using fastest loop
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]

      if (node.nodeType === Node.TEXT_NODE) {
        // For text nodes, process the parent element to ensure we catch all context
        const parentElement = node.parentElement
        if (parentElement && this.shouldProcessElement(parentElement)) {
          void this.textProcessor.processSubtree(parentElement, replacements, true)
        }
      }
      else if (node instanceof HTMLElement) {
        void this.textProcessor.processSubtree(node, replacements, true)
      }
    }
  }

  private shouldProcessElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()

    // Quick rejection for elements that definitely won't contain processable text
    return !(
      tagName === 'script'
      || tagName === 'style'
      || tagName === 'noscript'
      || tagName === 'template'
      || tagName === 'svg'
      || tagName === 'canvas'
      || tagName === 'video'
      || tagName === 'audio'
      || tagName === 'embed'
      || tagName === 'object'
      // Skip elements that are likely to be pure decoration
      || (element.getAttribute('aria-hidden') === 'true')
      // Skip if element has no text content and no accessibility attributes
      || (element.textContent?.trim().length === 0
        && !element.hasAttribute('alt')
        && !element.hasAttribute('aria-label')
        && !element.hasAttribute('aria-description')
        && !element.hasAttribute('title')
        && !element.hasAttribute('placeholder'))
    )
  }
}
