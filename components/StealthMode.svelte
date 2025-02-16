<script lang="ts">
  import type { UserSettings } from '@/utils/types'

  export let settings: UserSettings
  export let onSubmit: () => Promise<void>

  async function handleToggle() {
    settings.stealthMode = false
    await onSubmit()
  }
</script>

<div class="bg-white/90 backdrop-blur rounded-lg shadow-md p-4 border border-gray-200 min-h-[200px]">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-xl font-medium text-gray-800">
      Content Filter
    </h1>
    <button
      on:click={handleToggle}
      class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
    >
      Disable
    </button>
  </div>

  <p class="text-gray-600">
    Basic content filtering is active. Configure settings to customize filters.
  </p>
</div>
