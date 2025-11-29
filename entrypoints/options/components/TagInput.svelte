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

  function addPendingText(): boolean {
    if (inputValue.trim()) {
      const addResult = addTag(inputValue.trim())
      if (!addResult) {
        return false
      }
    }

    return true
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault()
      addTag(inputValue.trim())
    }
  }

  /**
   * Adds a tag to list of tags if it doesn't already exist and is a valid domain.
   * @param tag - The tag to add
   * @returns true if the tag was added or already existed, false if the tag was not valid
   */
  function addTag(tag: string): boolean {
    tag = tag.replace(/^www\./, '')

    const isMatch = validURLMatcher.match(tag)
    if (!isMatch) {
      const toastMessage = `Please enter a valid domain ${label ? `for the ${label.toLowerCase()}` : ''} (e.g. example.com or *.example.com)`
      toast.error(toastMessage, {
        position: 'bottom-right',
        className: 'text-lg',
      })
      return false
    }

    if (!tag || tags.includes(tag)) return true

    const newTags = [...tags, tag]
    onUpdate(newTags)
    inputValue = ''
    return true
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
          class="flex items-center justify-center text-primary-500 hover:text-primary-700 hover:bg-primary-200 rounded transition-colors duration-200 aspect-square w-5 h-5"
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
