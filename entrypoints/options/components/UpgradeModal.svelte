<script lang="ts">
  import type { UserSettings } from '@/utils/types'

  interface Props {
    settings: UserSettings
    onClose: () => void
  }

  let { settings, onClose }: Props = $props()

  // Handle ESC key to close modal
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  // Set focus to modal container when opened
  let modalContainer: HTMLElement

  $effect(() => {
    modalContainer.focus()
  })
</script>

<div
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  aria-labelledby="modal-title">
  <div
    class="bg-white p-8 rounded-lg shadow-xl max-w-2xl overflow-y-auto max-h-[90vh]"
    bind:this={modalContainer}
    tabindex="-1">
    <h2 id="modal-title" class="text-3xl font-medium mb-4 text-gray-800">Welcome to Deadname Remover v2.0! 🎉</h2>

    <div class="space-y-4 text-gray-600 mb-6" role="region" aria-label="New features information">
      <p class="text-lg">
        We've made significant improvements to make the extension faster, more reliable, and more user-friendly than ever before.
      </p>

      <div>
        <h3 id="whats-new" class="text-xl font-medium text-gray-700 mb-2">What's New:</h3>
        <ul class="list-disc list-inside space-y-2 ml-2 text-base" aria-labelledby="whats-new">
          <li>Improved performance and reliability</li>
          <li>Add unlimited preferred and deadnames, for yourself and others</li>
          <li>New theme options including trans and non-binary pride gradients</li>
          <li>Settings sync across devices now optional for privacy reasons</li>
          <li>Content blocking to prevent deadname flashing</li>
          <li>Enhanced accessibility features</li>
        </ul>
      </div>

      <div class="bg-amber-50 p-4 rounded-lg text-base" role="alert">
        <p class="text-amber-800">
          <strong>Important:</strong> Your settings have been migrated from the previous extension to a new format used in this extension. Please review your settings and confirm they match your expectations.
        </p>
      </div>

      {#if settings.syncSettingsAcrossDevices}
        <div class="bg-blue-50 p-4 rounded-lg text-base" role="alert">
          <p class="text-blue-800">
            <strong>Note:</strong> Your settings sync is enabled, as this was the only option in the previous version. Changes saved here will sync across all your devices. Review this and delete synced data if you don't want this behavior.
          </p>
        </div>
      {/if}
    </div>

    <button
      class="btn btn-lg w-full"
      onclick={onClose}
      aria-label="Close welcome modal and proceed to settings"
    >
      Got it, let's get started!
    </button>
  </div>
</div>

<svelte:window onkeydown={handleKeydown} />
