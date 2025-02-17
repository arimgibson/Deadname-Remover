import { getDataKey } from '@/entrypoints/content/utils'
import { debugLog } from '@/utils'
import type { ReplacementsMap } from '@/utils/types'

interface TextMatch {
  text: string
  index: number
  pattern: RegExp
  replacement: string
}

export const createReplacementPattern = (name: string): RegExp => {
  const escaped = name
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/['']/g, '[\'\']')
    .replace(/[-]/g, '[-]')
  // case insensitive and unicode -- case matching is done in the replaceTextInNode method
  return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'giu')
}

/*
This function doesn't provide an exact case match, which is by design.
It will either match all uppercase, all lowercase, or
default to capitalizing the first letter, i.e Ari

An exact case match could cause problems depending on the length of your name.
For example, with the proper name Aaron and deadname Isabella, this would be an exact match:
Isabella --> Aaron
isaBella --> aarOn
isabeLLA --> aaron (because Aaron is a shorter name, i.e. doesn't have 6th character to capitalize)
*/
function caseMatchReplacement(original: string, replacement: string): string {
  if (original === original.toUpperCase()) return replacement.toUpperCase()
  if (original === original.toLowerCase()) return replacement.toLowerCase()
  return replacement.charAt(0).toUpperCase() + replacement.slice(1)
}

export class TextProcessor {
  private static originalTitle: string | null = null
  private processedNodes = new WeakSet<Node>()
  private metrics = {
    nodesProcessed: 0,
    replacementsMade: 0,
    accessibilityAttributesUpdated: 0,
    processingTime: 0,
  }

  static readonly accessibilityAttributes = [
    'alt',
    'aria-label',
    'aria-description',
    'title',
    'placeholder',
  ] as const

  getMetrics() {
    return { ...this.metrics }
  }

  resetMetrics(): void {
    this.metrics = {
      nodesProcessed: 0,
      replacementsMade: 0,
      accessibilityAttributesUpdated: 0,
      processingTime: 0,
    }
  }

  processDocument({
    root,
    replacements,
  }: {
    root: HTMLElement
    replacements: ReplacementsMap
  }): void {
    const startTime = performance.now()

    // Store and process document title
    if (document.title) {
      TextProcessor.originalTitle = document.title
      replacements.forEach((replacement, pattern) => {
        if (pattern.test(document.title)) {
          document.title = document.title.replace(pattern, match =>
            caseMatchReplacement(match, replacement),
          )
          this.metrics.replacementsMade++
        }
      })
    }

    this.processSubtree(root, replacements)

    this.metrics.processingTime = performance.now() - startTime

    // @ts-expect-error -- values are defined by WXT
    if ((import.meta.env as { DEV: boolean }).DEV) {
      debugLog('replacement metrics', {
        nodesProcessed: this.metrics.nodesProcessed,
        replacementsMade: this.metrics.replacementsMade,
        accessibilityAttributesUpdated: this.metrics.accessibilityAttributesUpdated,
        processingTime: `${this.metrics.processingTime.toFixed(2)}ms`,
      })
    }
  }

  processSubtree(root: HTMLElement, replacements: ReplacementsMap, depth = Number.POSITIVE_INFINITY): void {
    if (depth === 0) return
    if (depth < 0) throw new Error('Depth cannot be negative')

    const nodeIterator = this.createNodeIterator(root)

    let processedDepth = 0

    let currentNode: Node | null
    while ((currentNode = nodeIterator.nextNode()) && processedDepth < depth) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        const textNode = currentNode as Text
        if (!this.processedNodes.has(textNode)) {
          const matches = this.findMatches(textNode.nodeValue ?? '', replacements)
          if (matches.length > 0) {
            this.replaceTextInNode(textNode, matches)
          }
        }
      }
      else {
      // Skip <mark> elements with the 'deadname' attribute
        if (
          currentNode.nodeType === Node.ELEMENT_NODE
          && (currentNode as HTMLElement).tagName.toLowerCase() === 'mark'
          && (currentNode as HTMLElement).hasAttribute('deadname')
        ) {
          continue
        }

        // Can be called from DOMObserver, which doesn't check shouldProcessElement
        // not just a duplicate check from createNodeIterator
        if (!this.shouldProcessElement(currentNode as HTMLElement)) return
        processedDepth++
        this.processElementNode(currentNode, replacements)
      }
    }
  }

  private createNodeIterator(root: HTMLElement) {
    return document.createNodeIterator(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const textNode = node as Text
            return this.shouldProcessText(textNode)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            return this.shouldProcessElement(node as HTMLElement)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_SKIP
          }

          // Path shouldn't reach here
          return NodeFilter.FILTER_ACCEPT
        },
      },
    )
  }

  private findMatches(text: string, replacements: ReplacementsMap): TextMatch[] {
    const matches: TextMatch[] = []

    for (const [pattern, replacement] of replacements) {
      pattern.lastIndex = 0 // Reset for global patterns
      let match
      while ((match = pattern.exec(text)) !== null) {
        matches.push({
          text: match[0],
          index: match.index,
          pattern,
          replacement,
        })
      }
    }

    // Need to sort matches by index to ensure they are processed in order
    // since we are looping through multiple replacement patterns
    return matches.sort((a, b) => a.index - b.index)
  }

  private processElementNode(node: Node, replacements: ReplacementsMap): void {
    this.metrics.nodesProcessed++

    const element = node as HTMLElement

    for (const attr of TextProcessor.accessibilityAttributes) {
      if (element.hasAttribute(attr)) {
        const value = element.getAttribute(attr)
        if (value) {
          let newValue = value
          replacements.forEach((replacement, pattern) => {
            newValue = newValue.replaceAll(pattern, match =>
              caseMatchReplacement(match, replacement),
            )
          })

          if (newValue !== value) {
            // Store original value before replacement (camelCase)
            element.dataset[getDataKey(attr)] = value
            element.setAttribute(attr, newValue)
            this.metrics.accessibilityAttributesUpdated++
          }
        }
      }
    }
  }

  private replaceTextInNode(textNode: Text, matches: TextMatch[]): boolean {
    const originalText = textNode.nodeValue
    if (!originalText || !textNode.parentNode) return false

    let lastIndex = 0
    // Create a fragment to hold the text and marks before replacement
    const fragments = new DocumentFragment()

    matches.forEach(({ text, index, replacement }) => {
      // Add any unmatched text that appears before the current match to the container
      if (index > lastIndex) {
        fragments.appendChild(
          document.createTextNode(originalText.slice(lastIndex, index)),
        )
      }

      // Create marked replacement (highlight determined by theme, set in style)
      const markElement = document.createElement('mark')
      markElement.setAttribute('deadname', '')
      markElement.dataset.original = text
      markElement.textContent = caseMatchReplacement(text, replacement)
      fragments.appendChild(markElement)

      this.metrics.replacementsMade++

      lastIndex = index + text.length
    })

    // Add any remaining text that appears after the last match to the container
    if (lastIndex < originalText.length) {
      fragments.appendChild(
        document.createTextNode(originalText.slice(lastIndex)),
      )
    }

    textNode.parentNode.replaceChild(fragments, textNode)
    this.processedNodes.add(textNode)
    return true
  }

  private shouldProcessText(textNode: Text): boolean {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element#forms
    const formElements = [
      'datalist',
      'fieldset',
      'form',
      'input',
      'optgroup',
      'option',
      'select',
      'textarea',
    ]

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes
    const excludedAttributes: Record<string, string[]> = {
      'contenteditable': ['true'],
      'role': [
        'checkbox',
        'input',
        'option',
        'searchbox',
        'select',
        'slider',
        'spinbutton',
        'switch',
        'textbox',
      ],
      'spellcheck': ['true'], // Often indicates editable content
      // ARIA attributes
      'aria-autocomplete': ['true'],
      'aria-multiline': ['true'],
      'aria-readonly': ['false'],
      'aria-disabled': ['false'],
      'data-editable': ['true'], // Common custom attribute
    }

    // Check if any ancestor element is a form element
    let currentElement: HTMLElement | null = textNode.parentElement
    while (currentElement) {
      if (
        formElements.includes(currentElement.tagName.toLowerCase())
        || !this.shouldProcessElement(currentElement)
      ) {
        return false
      }

      // Check for excluded attributes
      for (const [attr, values] of Object.entries(excludedAttributes)) {
        const attrValue = currentElement.getAttribute(attr)?.toLowerCase()
        if (attrValue !== undefined && values.includes(attrValue)) {
          return false
        }
      }

      currentElement = currentElement.parentElement
    }

    return true
  }

  private shouldProcessElement(element: HTMLElement): boolean {
    return !(
      element.tagName.toLowerCase() === 'script'
      || element.tagName.toLowerCase() === 'style'
      || element.tagName.toLowerCase() === 'noscript'
      || element.tagName.toLowerCase() === 'template'
    )
  }

  static revertAllReplacements(): void {
    debugLog('reverting all replacements')

    // Revert document title
    if (TextProcessor.originalTitle !== null) {
      document.title = TextProcessor.originalTitle
      TextProcessor.originalTitle = null
    }

    TextProcessor.accessibilityAttributes.forEach((attr) => {
      const selector = `[data-deadname-${attr}]`
      const dataKey = getDataKey(attr)
      document.querySelectorAll(selector).forEach((el) => {
        const original = (el as HTMLElement).dataset[dataKey]
        if (original) {
          (el as HTMLElement).setAttribute(attr, original)
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete (el as HTMLElement).dataset[dataKey]
        }
      })
    })

    const replacedMarks = document.querySelectorAll('mark[deadname]')
    replacedMarks.forEach((mark) => {
      const original = (mark as HTMLElement).dataset.original
      if (original) {
        const textNode = document.createTextNode(original)
        mark.parentNode?.replaceChild(textNode, mark)
      }
    })
  }
}
