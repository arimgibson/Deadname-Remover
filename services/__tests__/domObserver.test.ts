import { describe, expect, it, vi, afterAll } from 'vitest'
import { DOMObserver } from '../domObserver'
import { TextProcessor, createReplacementPattern } from '../textProcessor'

// This project's test environment has no real DOM (see siteFiltering.test.ts,
// which mocks `window` the same way), so we stand in minimal fakes for the
// handful of DOM APIs domObserver.ts touches.
class FakeMutationObserver {
  static instances: FakeMutationObserver[] = []
  lastObserveOptions: MutationObserverInit | undefined

  constructor(public callback: MutationCallback) {
    FakeMutationObserver.instances.push(this)
  }

  observe(_target: Node, options?: MutationObserverInit): void {
    this.lastObserveOptions = options
  }

  disconnect(): void {
    // no-op: nothing observes real DOM nodes in this fake
  }
}

vi.stubGlobal('MutationObserver', FakeMutationObserver)
vi.stubGlobal('document', { body: {} })
vi.stubGlobal('Node', { TEXT_NODE: 3 })

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('DOMObserver', () => {
  it('observes characterData mutations, not just childList', () => {
    FakeMutationObserver.instances = []
    const observer = new DOMObserver(new TextProcessor())

    observer.setup(new Map([[createReplacementPattern('Deadname'), 'Chosen']]))

    const [instance] = FakeMutationObserver.instances
    expect(instance.lastObserveOptions?.characterData).toBe(true)
  })

  it('reprocesses a mutated text node\'s parent (e.g. apps like Oracle Fusion/ADF that update text in place)', async () => {
    FakeMutationObserver.instances = []
    const textProcessor = new TextProcessor()
    const processSubtree = vi.spyOn(textProcessor, 'processSubtree').mockReturnValue(undefined)

    const observer = new DOMObserver(textProcessor)
    const replacements = new Map([[createReplacementPattern('Deadname'), 'Chosen']])
    observer.setup(replacements)

    const fakeParent = {
      textContent: 'Hello Deadname, welcome',
      getAttribute: () => null,
      querySelectorAll: () => [],
    } as unknown as HTMLElement
    const fakeTextNode = {
      nodeType: Node.TEXT_NODE,
      nodeValue: 'Hello Deadname, welcome',
      parentElement: fakeParent,
    } as unknown as Node

    const [instance] = FakeMutationObserver.instances
    instance.callback(
      [{ type: 'characterData', target: fakeTextNode } as unknown as MutationRecord],
      instance as unknown as MutationObserver,
    )

    // Processing is scheduled via requestIdleCallback, which falls back to
    // setTimeout(cb, 0) outside a real browser.
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(processSubtree).toHaveBeenCalledWith(fakeParent, replacements, false)

    // The flush path disconnects and re-observes; make sure the
    // re-observation still requests characterData mutations.
    expect(instance.lastObserveOptions?.characterData).toBe(true)
  })
})
