<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getConfig,
    setConfig,
    defaultSettings,
    setupConfigListener,
  } from '@/services/configService'
  import { checkForStealthUpgradeNotification, clearStealthUpgradeNotification } from '@/utils/migrations'
  import { errorLog, formatKeyboardShortcut, registerKeyboardShortcut } from '@/utils'
  import type { UserSettings } from '@/utils/types'
  import { themes } from '@/utils/types'
  import { generalSettingKeys } from '@/utils/constants'
  import toast, { Toaster } from 'svelte-french-toast'
  import StealthMode from '@/components/StealthMode.svelte'
  import WarningIcon from '@/components/WarningIcon.svelte'
  import InfoIcon from '@/components/InfoIcon.svelte'
  import type { ParsingStatus } from '@/utils/types'
  import { SiteFiltering } from '@/services/siteFiltering'

  let settings: UserSettings = $state(defaultSettings)

  let isLoading = $state(true)
  let firstSettingsLoaded = $state(false)
  let previousStealthMode = false
  let upgradeVersion = $state<string | null>(null)
  let keyboardListener: ((event: KeyboardEvent) => void) | null = null
  let parsingStatus = $state<ParsingStatus | null>(null)
  let siteFiltering = new SiteFiltering()
  let showMatchDetails = $state(false)

  onMount(() => {
    // Use a non-async function for onMount that returns the cleanup directly
    void (async () => {
      const config = await getConfig()
      parsingStatus = await siteFiltering.getParsingStatus()
      settings = config
      isLoading = false
      firstSettingsLoaded = true
      previousStealthMode = settings.stealthMode

      // Set up keyboard shortcut
      keyboardListener = await registerKeyboardShortcut({
        config: settings,
        listener: keyboardListener,
      })

      upgradeVersion = await checkForStealthUpgradeNotification()
      if (upgradeVersion) {
        toast(`Extension upgraded to v${upgradeVersion}! Visit options page for more information.`, {
          icon: InfoIcon,
          position: 'bottom-right',
          className: 'h-10 text-sm',
          duration: 5000,
        })
        await clearStealthUpgradeNotification()
      }
    })()

    // Return the cleanup function directly, not in an async context
    return () => {
      if (keyboardListener) {
        document.removeEventListener('keydown', keyboardListener, true)
      }
    }
  })

  $effect(() => {
    // Only show if user has updated, not on initial load
    if (!firstSettingsLoaded) {
      return
    }

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

    // Update keyboard shortcut whenever config changes
    void (async () => {
      keyboardListener = await registerKeyboardShortcut({
        config,
        listener: keyboardListener,
      })
    })()
  })

  async function handleSubmit() {
    try {
      await setConfig(settings)
      toast.success('Settings saved', {
        position: 'bottom-right',
        className: 'h-10 text-base',
      })
    }
    catch (error) {
      errorLog('Failed to save settings', error)
      toast.error('Failed to save', {
        position: 'bottom-right',
        className: 'h-10 text-base',
      })
    }
  }

  function getParsingStatusInfo() {
    if (!parsingStatus) {
      return { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }

    switch (parsingStatus.reason) {
      case 'enabled':
        return {
          text: 'Active',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          description: 'Names are being replaced on this site',
        }
      case 'extension_disabled':
        return {
          text: 'Disabled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Extension is disabled',
        }
      case 'blocked_by_blocklist':
        return {
          text: 'Blocked',
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          description: `Site is blocked by: ${(parsingStatus.blockMatch ?? 'unknown')}`,
        }
      case 'blocked_by_default':
        return {
          text: 'Blocked',
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          description: 'Site is not in allowlist and default allow is disabled',
        }
      case 'allowed_by_allowlist':
        return {
          text: 'Active',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          description: `Site is allowed by: ${(parsingStatus.allowMatch ?? 'unknown')}`,
        }
      default:
        return { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }
  }
</script>

<Toaster />
<main class="w-full bg-gray-50 p-4">
  {#if isLoading}{:else}
    {#if settings.stealthMode}
      <StealthMode settings={settings} onSubmit={handleSubmit} />
    {:else}
      <div
        class="bg-white/90 backdrop-blur rounded-lg shadow-md p-4 border border-gray-200 min-h-[200px]"
    >
      <h1 class="text-xl font-medium text-gray-800 mb-4">
        Deadname Remover Settings
      </h1>

      {#if parsingStatus}
        <div class="mb-4 px-3 py-2 rounded-md text-sm" class:bg-green-100={parsingStatus.reason === 'enabled' || parsingStatus.reason === 'allowed_by_allowlist'} class:text-green-800={parsingStatus.reason === 'enabled' || parsingStatus.reason === 'allowed_by_allowlist'} class:bg-orange-100={parsingStatus.reason === 'blocked_by_blocklist' || parsingStatus.reason === 'blocked_by_default'} class:text-orange-800={parsingStatus.reason === 'blocked_by_blocklist' || parsingStatus.reason === 'blocked_by_default'} class:bg-gray-100={parsingStatus.reason === 'extension_disabled'} class:text-gray-700={parsingStatus.reason === 'extension_disabled'}>
          <div class="flex items-center justify-between">
            <span>Status: {getParsingStatusInfo().text.toLowerCase()} on {parsingStatus.site ?? 'this site'}</span>
            {#if parsingStatus.allowMatch ?? parsingStatus.blockMatch ?? parsingStatus.reason === 'blocked_by_default'}
              <button
                type="button"
                class="text-xs opacity-70 hover:opacity-100 transition-opacity"
                onclick={() => showMatchDetails = !showMatchDetails}
                aria-label="Toggle match details"
              >
                <i
                  class="i-material-symbols:expand-more text-sm transition-transform duration-200"
                  class:rotate-180={showMatchDetails}
                  aria-label={showMatchDetails ? 'Hide details' : 'Show details'}
                ></i>
              </button>
            {/if}
          </div>
          {#if showMatchDetails}
            {#if parsingStatus.reason === 'allowed_by_allowlist' && parsingStatus.allowMatch}
              <div class="mt-1 text-xs opacity-80">allowed by {parsingStatus.allowMatch} in allowlist</div>
            {/if}
            {#if parsingStatus.reason === 'blocked_by_blocklist' && parsingStatus.blockMatch}
              <div class="mt-1 text-xs opacity-80">blocked by {parsingStatus.blockMatch} in blocklist</div>
            {/if}
            {#if parsingStatus.reason === 'blocked_by_default'}
              <div class="mt-1 text-xs opacity-80">not in allowlist (default allow disabled)</div>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- General Settings -->
      <section class="mb-4" aria-labelledby="general-settings-heading">
        <div class="space-y-3" role="group">
          {#each generalSettingKeys as setting (setting.value)}
            <label
              for={setting.value}
              class="flex justify-between items-center text-gray-700 text-sm"
            >
              {setting.label}
              <div class="accessible-switch switch-theme-400">
                <input
                  type="checkbox"
                  id={setting.value}
                  class="peer"
                  bind:checked={settings[setting.value]}
                  onchange={handleSubmit}
                  aria-describedby={`${setting.value}-description`}
                />
                <span class="switch-dot" role="presentation"></span>
              </div>
            </label>
          {/each}

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
                onchange={handleSubmit}
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

          <div class="flex justify-between items-center h-8 mt-3">
            <span class="text-gray-700 text-base">Current Keyboard Shortcut</span>
            <span
              class="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded"
              aria-label="Current keyboard shortcut status"
            >
              {settings.toggleKeybinding ? formatKeyboardShortcut(settings.toggleKeybinding) : 'Disabled'}
            </span>
          </div>
        </div>
      </section>

      <!-- Link to Options -->
      <a
        href={`options.html${upgradeVersion ? `?upgrade=v${upgradeVersion}` : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        class="block w-full text-center py-2 text-sm text-theme-400 hover:text-theme-500 transition-colors"
      >
        Open Full Settings
        </a>
      </div>
    {/if}
  {/if}
</main>

<style>
  /* Ensure popup has a fixed width */
  :global(body) {
    width: 500px;
    min-height: fit-content;
    margin: 0;
    padding: 0;
  }
</style>
