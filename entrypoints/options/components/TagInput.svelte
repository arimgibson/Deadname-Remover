<script lang="ts">
  import toast from 'svelte-french-toast'
  import { validURLMatcher } from '@/utils/validations'

  interface Props {
    tags: string[]
    placeholder?: string
    label: string
    description?: string
    onUpdate: (tags: string[]) => void
  }

  let { tags, placeholder = 'Add a domain (e.g. example.com)', label, description, onUpdate }: Props = $props()

  let inputValue = $state('')

  function addPendingText() {
    if (inputValue.trim()) {
      addTag(inputValue.trim())
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault()
      addTag(inputValue.trim())
    }
  }

  function addTag(tag: string) {
    tag = tag.replace(/^www\./, '')

    const isMatch = validURLMatcher.match(tag)
    if (!isMatch) {
      toast.error('Please enter a valid domain (e.g. example.com or *.example.com)', {
        position: 'bottom-right',
        className: 'h-12 text-lg px-6 py-3',
      })
      return
    }

    if (!tag || tags.includes(tag)) return

    const newTags = [...tags, tag]
    onUpdate(newTags)
    inputValue = ''
  }

  function removeTag(index: number) {
    const newTags = tags.filter((_, i) => i !== index)
    onUpdate(newTags)
  }

  export { addPendingText }
</script>

<div class="space-y-2">
  <label for="tag-input" class="text-lg font-medium text-gray-600">{label}</label>
  {#if description}
    <p class="text-sm text-gray-500">{description}</p>
  {/if}

  <div class="flex flex-wrap gap-2 p-2 border rounded bg-white">
    {#each tags as tag, index (tag)}
      <div class="flex items-center gap-1 bg-primary-50 border border-primary-200 px-2 py-1 rounded text-sm text-primary-700 transition-all duration-200 hover:bg-primary-100 hover:border-primary-300">
        <span>{tag}</span>
        <button
          type="button"
          class="text-primary-500 hover:text-primary-700 hover:bg-primary-200 rounded p-0.5 transition-colors duration-200"
          onclick={() => { removeTag(index) }}
          aria-label="Remove tag"
        >
          <i class="i-material-symbols:close text-lg" aria-hidden="true"></i>
        </button>
      </div>
    {/each}
    <input
      type="text"
      id="tag-input"
      class="flex-1 min-w-200px border rounded peer input"
      placeholder={placeholder}
      bind:value={inputValue}
      onkeydown={handleKeydown}
    />
  </div>
</div>
