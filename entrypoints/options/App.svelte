<!-- ESLint ignores explained:
 1. $state.snapshot(settings) is read as Array<T> by type checker,
    losing the constraint that the array has 2 elements. ESLint doesn't
    like that we use a type assertion it deems unnecessary, though otherwise
    TypeScript throws an error
 2. Some uses of document.querySelector intentionally use a non-null assertion,
    because we know the element exists as we define it as an element in the app
 3. Some uses of document.querySelector are typed via `as` to be HTMLInputElement,
    because we know the element is an input and focusable, which prevents other
    ESLint errors about unsafe calls (`.focus()`) on the element
 -->

<script lang="ts">
  import { onMount } from 'svelte'
  import type { SvelteComponent } from 'svelte'
  import {
    getConfig,
    setConfig,
    defaultSettings,
    setupConfigListener,
    deleteSyncedData,
  } from '@/services/configService'
  import {
    filterEmptyArraysFromDiff,
    debugLog,
    errorLog,
  } from '@/utils'
  import {
    validateNoDuplicateDeadnames,
    validateNoRecursiveMappings,
    validateNoSelfMappings,
  } from '@/utils/validations'
  import type { UserSettings } from '@/utils/types'
  import { themes } from '@/utils/types'
  import { generalSettingKeys, nameKeys } from '@/utils/constants'
  import toast, { Toaster } from 'svelte-french-toast'
  import 'text-security/text-security-disc.css'
  import diff from 'microdiff'
  import ToastWithButton from '@/components/UnsavedChangesToast.svelte'
  import WarningIcon from '@/components/WarningIcon.svelte'
  import { fade } from 'svelte/transition'

  let settings = $state<UserSettings>(defaultSettings)
  let initialSettings = $state<UserSettings | null>(null)

  let isLoading = $state(true)
  let firstSettingsLoaded = $state(false)
  let previousStealthMode = false

  let hideDeadnames = $state(true)

  let unsavedChanges = $derived.by(() => {
    if (initialSettings) {
      const changes = diff(initialSettings, settings)
      const filteredChanges = filterEmptyArraysFromDiff(changes)
      debugLog('options page changes', filteredChanges)
      return filteredChanges.length
    }
    return 0
  })

  let showUpgradeModal = $state(false)
  let showFaqModal = $state(false)
  let showFaqTooltip = $state(false)

  const faqs = [
    {
      question: 'How do I add multiple names?',
      answer: 'Click the "Add Name" button under each name type in the "Name Replacement" section to add as many names as you want. Each name should have a deadname and the proper name to replace it with.',
    },
    {
      question: 'Why aren\'t names being replaced in text inputs, forms, or other editable content?',
      answer: 'To prevent accidentally outing users, the extension doesn\'t replace text in input fields, forms, or editable content. This prevents accidental submission of replaced names in emails, messages, or documents. If there\'s a place your name isn\'t replaced but you think it should be, please submit a bug (see below).',
    },
    {
      question: 'What should I do if content shifts around when using the "Block Page Until Replacements Finished" feature?',
      answer: 'If you notice content jumping or shifting around the page when using the content blocking feature, please submit a bug (see below). Include the website URL and a description of what\'s happening to help someone fix it.',
    },
    {
      question: 'Why am I still seeing my deadname flash on the page, even with the "Content Blocking" feature enabled?',
      answer: 'Due to how some websites render content, it\'s possible to see a deadname flash on the screen briefly, especially after the initial page load. The extension is built to replace these as soon as possible, so if it flashes for more than a few seconds or never updates, please submit a bug (see below).',
    },
    {
      question: 'How do I report bugs or request features?',
      answer: 'You can submit bugs or feature requests through GitHub Issues or email. Visit <a class="link" href="https://github.com/arimgibson/deadname-remover/issues/new" target="_blank" rel="noreferrer">github.com/arimgibson/deadname-remover/issues</a> to create a new issue, or email <a class="link" href="mailto:hi@arigibson.com">hi@arigibson.com</a> if you prefer not to use GitHub. I\'ll add it in the GitHub Issues board for tracking and email you back the link to follow along.',
    },
  ]

  const errorMessages = {
    emptyDeadname: 'Deadname must not be empty',
    emptyProperName: 'Proper name must not be empty',
    duplicate: 'Deadname already exists',
    self: 'Cannot set deadname to proper name',
    recursive: 'Cannot set deadname to a name that has already been replaced',
  } as const

  onMount(async () => {
    const config = await getConfig()
    settings = config
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    initialSettings = $state.snapshot(settings) as UserSettings
    isLoading = false
    firstSettingsLoaded = true
    previousStealthMode = settings.stealthMode
    // Check URL parameters for upgrade flag and first time flag
    const params = new URLSearchParams(window.location.search)
    showUpgradeModal = params.get('upgrade') === 'v2.0.0'
    showFaqTooltip = params.get('firstTime') === 'true'
  })

  $effect(() => {
    // Only show if user has updated, not on initial load
    if (!firstSettingsLoaded) {
      return
    }

    if (unsavedChanges === 0) {
      toast.dismiss('unsaved-changes')
      return
    }

    // couple workarounds here til toast package is updated
    toast.error(ToastWithButton as unknown as typeof SvelteComponent, {
      // @ts-expect-error -- doesn't exist in expected options because is custom prop
      unsavedChanges,
      onClick: () => {
        if (initialSettings) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          settings = $state.snapshot(initialSettings) as UserSettings
        }
      },
      position: 'bottom-right',
      className: 'h-12 text-lg',
      duration: Infinity,
      id: 'unsaved-changes',
    })

    // Dismiss toast if either setting is disabled
    if (!settings.stealthMode || !settings.highlightReplacedNames) {
      toast.dismiss('stealth-mode-warning')
    }
    // Only show warning when stealthMode is specifically toggled from false to true
    // This prevents the toast from showing when highlightReplacedNames changes
    // or when the page first loads with both settings enabled
    else if (!previousStealthMode) {
      toast(
        'When using Stealth Mode, consider disabling highlights for privacy',
        {
          icon: WarningIcon,
          position: 'bottom-right',
          className: 'text-base',
          duration: 3000,
          id: 'stealth-mode-warning',
        },
      )

      setTimeout(() => {
        toast.dismiss('stealth-mode-warning')
      }, 3000)
    }

    // Update the previous state for the next effect run
    previousStealthMode = settings.stealthMode
  })

  function validateNameField({
    target,
    type,
    name,
    index,
  }: {
    target: HTMLInputElement
    type: 'deadname' | 'properName'
    name: string
    index: number
  }) {
    if (target.value.trim().length === 0) {
      setNameFieldError({
        target,
        type,
        name,
        index,
        errorType: type === 'deadname' ? 'emptyDeadname' : 'emptyProperName',
      })
      return
    }

    if (type === 'deadname') {
      const noDuplicates = validateNoDuplicateDeadnames(settings.names)
      if (!noDuplicates) {
        setNameFieldError({
          target,
          type,
          name,
          index,
          errorType: 'duplicate',
        })
        return
      }
    }

    const noSelfMappings = validateNoSelfMappings(settings.names)
    if (!noSelfMappings) {
      setNameFieldError({
        target,
        type,
        name,
        index,
        errorType: 'self',
      })
      return
    }

    const noRecursiveMappings = validateNoRecursiveMappings(settings.names)
    if (!noRecursiveMappings) {
      setNameFieldError({
        target,
        type,
        name,
        index,
        errorType: 'recursive',
      })
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const errorField: HTMLParagraphElement = document.querySelector(`#nameField-error-${name}-${String(index)}`)!
    if (errorField.dataset.errorType === 'self' || errorField.dataset.nameType === type) {
      target.ariaInvalid = 'false'
      errorField.dataset.nameType = ''
      errorField.dataset.errorType = ''
      errorField.textContent = ''
      target.removeAttribute('aria-describedby')
    }
  }

  function setNameFieldError({
    target,
    type,
    name,
    index,
    errorType,
  }: {
    target: HTMLInputElement
    type: 'deadname' | 'properName'
    name: string
    index: number
    errorType: keyof typeof errorMessages
  }) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const errorField: HTMLParagraphElement = document.querySelector(`#nameField-error-${name}-${String(index)}`)!
    target.ariaInvalid = 'true'
    errorField.dataset.nameType = type
    errorField.dataset.errorType = errorType
    errorField.textContent = errorMessages[errorType]
    target.setAttribute('aria-describedby', `nameField-error-${name}-${String(index)}`)
  }

  // Reset page state if config changes (to keep in sync with popup changes)
  setupConfigListener((config) => {
    settings = config
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    initialSettings = $state.snapshot(settings) as UserSettings
  })

  async function handleSubmit() {
    try {
      await setConfig(settings)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      initialSettings = $state.snapshot(settings) as UserSettings
      toast.success('Settings saved', {
        position: 'bottom-right',
        className: 'h-12 text-lg',
      })
    }
    catch (error) {
      errorLog('error saving settings', error)
      toast.error('Invalid settings', {
        position: 'bottom-right',
        className: 'h-12 text-lg',
      })
    }
  }
</script>

<Toaster />
<main class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
  {#if isLoading}{:else}
    <form
      class="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur rounded-xl shadow-lg p-8 border border-gray-200"
      onsubmit={(e) => {
        e.preventDefault()
        void handleSubmit()
      }}
      aria-label="Settings form"
    >
      <h1 class="text-3xl font-medium text-gray-800 mb-6 flex items-center justify-between">
        Deadname Remover Settings
        <div class="relative">
          <button
          type="button"
          class="btn theme-400 text-sm"
          onclick={() => {
            showFaqModal = true
            showFaqTooltip = false
          }}
          aria-label="Show FAQ"
        >
          <i class="i-material-symbols:help-outline text-lg" aria-hidden="true"></i>
            FAQ
          </button>
          {#if showFaqTooltip}
            <span
              class="right-tooltip animate-fade-in-right-horizontal"
              transition:fade={{ duration: 200 }}
            >
              <div class="flex items-center justify-between gap-4">
                <div class="text-lg font-medium">First time? 👋</div>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 flex items-center justify-center"
                  onclick={() => showFaqTooltip = false}
                  aria-label="Close tooltip"
                >
                  <i class="i-material-symbols:close text-lg"></i>
                </button>
              </div>
              <div class="text-sm max-w-[200px]">Check out our FAQs before you start configuring your settings</div>
            </span>
          {/if}
        </div>
      </h1>

      <!-- General Settings -->
      <section class="mb-8" aria-labelledby="general-settings-heading">
        <h2
          id="general-settings-heading"
          class="text-xl font-medium text-gray-700 mb-4"
        >
          General Settings
        </h2>
        <div
          class="space-y-6"
          role="group"
          aria-labelledby="general-settings-heading"
        >
          {#each generalSettingKeys as setting}
            <div>
              <label
                for={setting.value}
                class="flex justify-between items-center text-gray-700 text-base"
                >{setting.label}
                <div class="switch switch-theme-400">
                  <input
                    type="checkbox"
                    id={setting.value}
                    class="peer"
                    bind:checked={settings[setting.value]}
                    aria-describedby={`${setting.value}-description`}
                  />
                  <span class="switch-dot" role="presentation"></span>
                </div>
              </label>
              <p
                id={`${setting.value}-description`}
                class="text-sm text-gray-500 mt-2"
              >
                {setting.description}
              </p>
              {#if setting.value === 'syncSettingsAcrossDevices'}
                <button
                  type="button"
                  class="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  onclick={async () => {
                    if (
                      confirm(
                        'This will migrate your synced settings to local settings on this device, and reset all other devices relying on synced settings to default settings. Are you sure?',
                      )
                    ) {
                      const isSynced
                        = initialSettings?.syncSettingsAcrossDevices ?? false
                      await deleteSyncedData(isSynced)
                      toast.success('Synced data deleted', {
                        position: 'bottom-right',
                        className: 'h-12 text-lg',
                      })
                      const config = await getConfig()
                      settings = config
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                      initialSettings = $state.snapshot(settings) as UserSettings
                    }
                  }}
                >
                  <i
                    class="i-material-symbols:delete-outline text-lg"
                    aria-hidden="true"
                  ></i>
                  Delete Synced Data
                </button>
              {/if}
            </div>
          {/each}

          <div>
            <div class="flex justify-between items-center h-8">
              <label for="theme-select" class="text-gray-700 text-base"
                >Theme</label
              >
              <div class="relative w-fit text-theme-400">
                <select
                  id="theme-select"
                  class="input input-sm appearance-none pr-6 w-fit"
                  bind:value={settings.theme}
                  aria-label="Select theme"
                >
                  {#each themes as theme}
                    <option value={theme.value}>{theme.label}</option>
                  {/each}
                </select>
                <i
                  class="i-material-symbols:arrow-drop-down text-xl absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                ></i>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              Changes the color of the highlight on replaced names.
            </p>
          </div>
        </div>
      </section>

      <!-- Name Mappings -->
      <section class="mb-8" aria-labelledby="name-replacement-heading">
        <div class="flex justify-between items-center mb-4">
          <h2
            id="name-replacement-heading"
            class="text-xl font-medium text-gray-700"
          >
            Name Replacement
          </h2>
          <button
            type="button"
            class="btn theme-400 text-sm flex items-center gap-2"
            onclick={() => (hideDeadnames = !hideDeadnames)}
            aria-label={hideDeadnames ? 'Show deadnames' : 'Hide deadnames'}
          >
            <i
              class={`text-lg ${hideDeadnames ? 'i-material-symbols:visibility-off' : 'i-material-symbols:visibility'}`}
              aria-hidden="true"
            ></i>
            {hideDeadnames ? 'Show' : 'Hide'} Deadnames
          </button>
        </div>
        <div class="space-y-6">
          {#each nameKeys as name}
            <fieldset>
              <legend class="text-lg font-medium text-gray-600 mb-2"
                >{name.label}</legend
              >
              <div class="relative">
                <div class="space-y-2">
                  {#each settings.names[name.value] as _names, index}
                    <div
                      class="name-pair-row-grid gap-2 items-center"
                      role="group"
                      aria-label={`${name.label} pair ${String(index + 1)}`}
                    >
                      <input
                        type="text"
                        id={`deadname-${name.value}-${String(index)}`}
                        class="input border rounded peer"
                        class:obscured={hideDeadnames}
                        placeholder="Deadname"
                        aria-required="true"
                        aria-label="Deadname"
                        autocomplete="off"
                        bind:value={settings.names[name.value][index]
                          .mappings[0]}
                        onkeydown={(e: KeyboardEvent) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            settings.names[name.value].push({
                              mappings: ['', ''],
                            })
                            // Wait for DOM update then focus new input
                            setTimeout(() => {
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
                              ((document.querySelector(`#deadname-${name.value}-${String(settings.names[name.value].length - 1)}`)!) as HTMLInputElement).focus()
                            }, 0)
                          }
                        }}
                        oninput={(e) => {
                          validateNameField({
                            target: (e as Event).target as HTMLInputElement,
                            type: 'deadname',
                            name: name.value,
                            index,
                          })
                        }}
                      />
                      <input
                        type="text"
                        class="input border rounded peer"
                        placeholder="Proper name"
                        aria-required="true"
                        aria-label="Proper name"
                        bind:value={settings.names[name.value][index]
                          .mappings[1]}
                        onkeydown={(e: KeyboardEvent) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            settings.names[name.value].push({
                              mappings: ['', ''],
                            })
                            // Wait for DOM update then focus new input
                            setTimeout(() => {
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
                              ((document.querySelector(`#properName-${name.value}-${String(settings.names[name.value].length - 1)}`)!) as HTMLInputElement).focus()
                            }, 0)
                          }
                        }}
                        oninput={(e) => {
                          validateNameField({
                            target: (e as Event).target as HTMLInputElement,
                            type: 'properName',
                            name: name.value,
                            index,
                          })
                        }}
                      />
                      <button
                        type="button"
                        onclick={() =>
                          settings.names[name.value].splice(index, 1)}
                        class="text-red-500 hover:text-red-700"
                        aria-label={`Remove ${name.label} pair ${String(index + 1)}`}
                      >
                        <i
                          class="i-material-symbols:delete-outline text-xl"
                          aria-hidden="true"
                        ></i>
                      </button>
                      <p
                        id={`nameField-error-${name.value}-${String(index)}`}
                        class="text-red-500 text-sm input-error col-span-full"
                      ></p>
                    </div>
                  {/each}
                </div>
                <button
                  type="button"
                  onclick={() => {
                    settings.names[name.value].push({ mappings: ['', ''] })
                    setTimeout(() => {
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
                      ((document.querySelector(`#deadname-${name.value}-${String(settings.names[name.value].length - 1)}`)!) as HTMLInputElement).focus()
                    }, 0)
                  }}
                  class="btn btn-dashed border-2 w-full mt-2 hover:bg-theme-50"
                  aria-label={`Add new ${name.label} pair`}
                >
                  <i class="i-material-symbols:add-2 text-lg" aria-hidden="true"
                  ></i>
                  Add {name.label}
                </button>
              </div>
            </fieldset>
          {/each}
        </div>
      </section>

      <!-- Save Button -->
      <button type="submit" class="btn solid w-full" aria-label="Save settings">
        Save Settings
      </button>
    </form>
  {/if}
</main>

{#if showUpgradeModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-2xl overflow-y-auto max-h-[90vh]">
      <h2 class="text-3xl font-medium mb-4 text-gray-800">Welcome to Deadname Remover v2.0! 🎉</h2>

      <div class="space-y-4 text-gray-600 mb-6">
        <p class="text-lg">
          We've made significant improvements to make the extension faster, more reliable, and more user-friendly than ever before.
        </p>

        <div>
          <h3 class="text-xl font-medium text-gray-700 mb-2">What's New:</h3>
          <ul class="list-disc list-inside space-y-2 ml-2 text-base">
            <li>Improved performance and reliability</li>
            <li>Add unlimited preferred and deadnames, for yourself and others</li>
            <li>New theme options including trans and non-binary pride gradients</li>
            <li>Settings sync across devices now optional for privacy reasons</li>
            <li>Content blocking to prevent deadname flashing</li>
            <li>Enhanced accessibility features</li>
          </ul>
        </div>

        <div class="bg-amber-50 p-4 rounded-lg text-base">
          <p class="text-amber-800">
            <strong>Important:</strong> Your settings have been migrated from the previous extension to a new format used in this extension. Please review your settings and confirm they match your expectations.
          </p>
        </div>

        {#if settings.syncSettingsAcrossDevices}
          <div class="bg-blue-50 p-4 rounded-lg text-base">
            <p class="text-blue-800">
              <strong>Note:</strong> Your settings sync is enabled, as this was the only option in the previous version. Changes saved here will sync across all your devices. Review this and delete synced data if you don't want this behavior.
            </p>
          </div>
        {/if}
      </div>

      <button
        class="btn btn-lg w-full"
        onclick={() => showUpgradeModal = false}
      >
        Got it, let's get started!
      </button>
    </div>
  </div>
{/if}

<!-- Add FAQ Modal -->
{#if showFaqModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl flex flex-col max-h-[90vh]">
      <div class="p-8 pb-4">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-medium text-gray-800">Frequently Asked Questions</h2>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700"
            onclick={() => showFaqModal = false}
            aria-label="Close FAQ"
          >
            <i class="i-material-symbols:close text-2xl"></i>
          </button>
        </div>
      </div>

      <div class="overflow-y-auto px-8">
        <div class="space-y-6">
          {#each faqs as faq}
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
          onclick={() => showFaqModal = false}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .obscured {
    /* Leverages the text-security npm package */
    font-family: text-security-disc;
    /* Use -webkit-text-security if the browser supports it */
    -webkit-text-security: disc;
  }

  .obscured::placeholder {
    /* Use default Onu UI font for placeholder text */
    font-family: "DM Sans", "DM Sans:400,700";
  }
</style>
