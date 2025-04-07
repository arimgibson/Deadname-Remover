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
    formatKeyboardShortcut,
    debugLog,
    errorLog,
  } from '@/utils'
  import type { UserSettings } from '@/utils/types'
  import { themes } from '@/utils/types'
  import { generalSettingKeys } from '@/utils/constants'
  import toast, { Toaster } from 'svelte-french-toast'
  import 'text-security/text-security-disc.css'
  import diff from 'microdiff'
  import ToastWithButton from '@/components/UnsavedChangesToast.svelte'
  import WarningIcon from '@/components/WarningIcon.svelte'
  import { fade } from 'svelte/transition'
  import UpgradeModal from './components/UpgradeModal.svelte'
  import FaqModal from './components/FaqModal.svelte'
  import NameMappings from './components/NameMappings.svelte'

  let settings = $state<UserSettings>(defaultSettings)
  let initialSettings = $state<UserSettings | null>(null)
  let platform = $state<'mac' | 'windows' | 'linux' | 'other'>('other')

  let isLoading = $state(true)
  let firstSettingsLoaded = $state(false)
  let previousStealthMode = false

  let hideDeadnames = $state(true)

  let unsavedChanges = $derived.by(() => {
    if (initialSettings) {
      const changes = diff(initialSettings, settings)
      console.log('changes', changes)

      // Find index of first keybinding change (if any)
      const keybindingIndex = changes.findIndex(c => c.path[0] === 'toggleKeybinding')

      // Create a filtered list with at most one keybinding change
      const normalizedChanges = keybindingIndex >= 0
        ? [
            // Add the representative keybinding change (just use the first one)
            changes[keybindingIndex],
            // Add all non-keybinding changes
            ...changes.filter(c => c.path[0] !== 'toggleKeybinding'),
          ]
        : changes

      const filteredChanges = filterEmptyArraysFromDiff(normalizedChanges)
      void debugLog('options page changes', filteredChanges)
      return filteredChanges.length
    }
    return 0
  })

  let showUpgradeModal = $state(false)
  let showFaqModal = $state(false)
  let showFaqTooltip = $state(false)

  let captureShortcut = $state(false)

  onMount(async () => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mac')) platform = 'mac'
    else if (userAgent.includes('win')) platform = 'windows'
    else if (userAgent.includes('linux')) platform = 'linux'

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

  function applyShortcut(shortcut: typeof settings.toggleKeybinding) {
    // Create a deep copy of the current settings to avoid reference issues
    const updatedSettings = $state.snapshot(settings)
    updatedSettings.toggleKeybinding = shortcut
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    settings = updatedSettings as UserSettings
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
          {#each generalSettingKeys as setting (setting.value)}
            <div>
              <label
                for={setting.value}
                class="flex justify-between items-center text-gray-700 text-base"
                >{setting.label}
                <div class="accessible-switch switch-theme-400">
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
                  {#each themes as theme (theme.value)}
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

          <div>
            <label for="keyboard-shortcut" class="text-gray-700 text-base">Enable/Disable Extension Keyboard Shortcut</label>
            <div class="mt-2">
              <div
                id="keyboard-shortcut"
                class="input border rounded flex items-center justify-between p-2 cursor-pointer"
                tabindex="0"
                role="button"
                aria-label="Press keys to set shortcut"
                onclick={() => captureShortcut = true}
                onkeydown={(e) => {
                  if (captureShortcut) {
                    e.preventDefault()

                    // Skip if only modifier keys are pressed
                    const isModifierKey = ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)
                    if (!isModifierKey) {
                      settings.toggleKeybinding = {
                        key: e.key,
                        alt: e.altKey,
                        ctrl: e.ctrlKey,
                        shift: e.shiftKey,
                        meta: e.metaKey,
                      }
                      captureShortcut = false
                    }
                  }
                }}
                onblur={() => captureShortcut = false}
              >
                <span class={captureShortcut ? 'text-theme-500' : 'text-gray-700'}>
                  {captureShortcut
                    ? 'Press keys...'
                    : settings.toggleKeybinding
                      ? formatKeyboardShortcut(settings.toggleKeybinding)
                      : 'Disabled -- Click Here to Set'}
                </span>
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700"
                  onclick={(e) => {
                    e.stopPropagation()
                    settings.toggleKeybinding = defaultSettings.toggleKeybinding
                  }}
                  aria-label="Reset to default shortcut"
                >
                  <i class="i-material-symbols:refresh text-lg" aria-hidden="true"></i>
                </button>
              </div>

              <!-- Suggested shortcuts section -->
              <div class="mt-4">
                <p class="text-sm text-gray-700 mb-2">
                  Suggested shortcuts {platform === 'mac' ? '(for Mac)' : '(for Windows/Linux)'}:
                </p>
                <div class="flex flex-wrap gap-2">
                  {#if platform === 'mac'}
                    {#each [
                      { label: '⌥ Option+Q', shortcut: { key: 'q', alt: true, ctrl: false, shift: false, meta: false } },
                      { label: '⌥⇧ Option+Shift+Q', shortcut: { key: 'q', alt: true, ctrl: false, shift: true, meta: false } },
                      { label: '⌥ Option+W', shortcut: { key: 'w', alt: true, ctrl: false, shift: false, meta: false } },
                      { label: '⌘⌥ Command+Option+Z', shortcut: { key: 'z', alt: true, ctrl: false, shift: false, meta: true } },
                    ] as suggestion (suggestion.label)}
                      <button
                        type="button"
                        class="btn btn-sm border border-gray-300 hover:bg-gray-100"
                        onclick={() => {
                          applyShortcut(suggestion.shortcut)
                        }}
                      >
                        {suggestion.label}
                      </button>
                    {/each}
                  {:else}
                    {#each [
                      { label: 'Alt+Q', shortcut: { key: 'q', alt: true, ctrl: false, shift: false, meta: false } },
                      { label: 'Alt+Shift+Q', shortcut: { key: 'q', alt: true, ctrl: false, shift: true, meta: false } },
                      { label: 'Alt+W', shortcut: { key: 'w', alt: true, ctrl: false, shift: false, meta: false } },
                      { label: 'Ctrl+Alt+Z', shortcut: { key: 'z', alt: true, ctrl: true, shift: false, meta: false } },
                    ] as suggestion (suggestion.label)}
                      <button
                        type="button"
                        class="btn btn-sm border border-gray-300 hover:bg-gray-100"
                        onclick={() => {
                          applyShortcut(suggestion.shortcut)
                        }}
                      >
                        {suggestion.label}
                      </button>
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              <strong class="mb-4 inline-block">Note: it is recommended to ensure the key combination used is not already in use by another browser feature or extension.</strong>
              <br />
              Keyboard shortcut to quickly enable or disable the extension. Does not show any indication of being toggled for privacy purposes. Shortcut does not work on this page, please test on a different page after setting.
            </p>
          </div>
        </div>
      </section>

      <!-- Name Mappings -->
      <NameMappings
        settings={settings}
        hideDeadnames={hideDeadnames}
        onToggleHideDeadnames={() => hideDeadnames = !hideDeadnames}
      />

      <!-- Save Button -->
      <button type="submit" class="btn solid w-full" aria-label="Save settings">
        Save Settings
      </button>
    </form>
  {/if}
</main>

{#if showUpgradeModal}
  <UpgradeModal
    settings={settings}
    onClose={() => showUpgradeModal = false}
  />
{/if}

{#if showFaqModal}
  <FaqModal
    onClose={() => showFaqModal = false}
  />
{/if}
