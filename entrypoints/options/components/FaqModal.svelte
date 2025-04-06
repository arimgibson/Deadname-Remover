<script lang="ts">
  import { faqs } from '../constants'

  interface Props {
    onClose: () => void
  }

  let { onClose }: Props = $props()
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-lg shadow-xl max-w-2xl flex flex-col max-h-[90vh]">
    <div class="p-8 pb-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-medium text-gray-800">Frequently Asked Questions</h2>
        <button
          type="button"
          class="text-gray-500 hover:text-gray-700"
          onclick={onClose}
          aria-label="Close FAQ"
        >
          <i class="i-material-symbols:close text-2xl"></i>
        </button>
      </div>
    </div>

    <div class="overflow-y-auto px-8">
      <div class="space-y-6">
        {#each faqs as faq (faq.question)}
          <div class="border-b border-gray-200 pb-4 last:border-0">
            <h3 class="text-lg font-medium text-gray-700 mb-2 last:mb-0">{faq.question}</h3>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- safe as HTML is hardcoded -->
            <p class="text-gray-600 text-base [&_a]:text-theme-500 [&_a]:hover:text-theme-600">{@html faq.answer}</p>
          </div>
        {/each}
      </div>
    </div>

    <div class="p-8 pt-4">
      <button
        class="btn solid w-full"
        onclick={onClose}
      >
        Close
      </button>
    </div>
  </div>
</div>
