<script lang="ts">
  import { onMount } from 'svelte'
  import type { Toast as Toast_ } from 'svelte-french-toast'

  // workaround til toast package is updated
  interface Toast extends Toast_ {
    unsavedChanges: number
    onClick: () => void
  }

  interface Props {
    toast: Toast
  }

  let { toast }: Props = $props()

  // update styling on parent to fit button element better
  // this allows me to change the parent without having access to it
  let spanElement: HTMLSpanElement

  onMount(() => {
    const parent = spanElement.parentElement
    if (parent && !parent.classList.contains('mr-0!')) {
      parent.classList.add('mr-0!')
    }
  })
</script>

<span bind:this={spanElement}>
  {toast.unsavedChanges} unsaved {toast.unsavedChanges === 1
    ? 'change'
    : 'changes'}
  <button class="btn btn-dashed ml-2" onclick={toast.onClick}>Reset</button>
</span>
