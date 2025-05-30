<script lang="ts">
  interface Props {
    tags: string[]
    placeholder?: string
    label: string
    description?: string
    onUpdate: (tags: string[]) => void
  }

  let { tags, placeholder = 'Add a domain (e.g. example.com)', label, description, onUpdate }: Props = $props()

  let inputValue = $state('')

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault()
      addTag(inputValue.trim())
    }
  }

  function addTag(tag: string) {
    tag = tag.replace(/^www\./, '')
    try {
      new URL(`https://${tag}`)
    }
    catch {
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
</script>

<div class="space-y-2">
  <label for="tag-input" class="text-lg font-medium text-gray-600">{label}</label>
  {#if description}
    <p class="text-sm text-gray-500">{description}</p>
  {/if}

  <div class="flex flex-wrap gap-2 p-2 border rounded bg-white">
    {#each tags as tag, index (tag)}
      <div class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
        <span>{tag}</span>
        <button
          type="button"
          class="text-gray-500 hover:text-gray-700"
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
      class="flex-1 min-w-[200px] outline-none bg-transparent"
      placeholder={placeholder}
      bind:value={inputValue}
      onkeydown={handleKeydown}
    />
  </div>
</div>
