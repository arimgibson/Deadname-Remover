<script lang="ts">
  import { nameKeys } from '@/utils/constants'
  import { validateNameField } from '../utils'
  import type { UserSettings, Names } from '@/utils/types'

  interface Props {
    settings: UserSettings
    hideDeadnames: boolean
    onToggleHideDeadnames: () => void
  }

  let { settings, hideDeadnames, onToggleHideDeadnames }: Props = $props()
</script>

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
      onclick={onToggleHideDeadnames}
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
    {#each nameKeys as name (name.value)}
      <fieldset>
        <legend class="text-lg font-medium text-gray-600 mb-2"
          >{name.label}</legend
        >
        <div class="relative">
          <div class="space-y-2">
            {#each settings.names[name.value] as _names, index (name.value + '-' + String(index))}
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
                  placeholder={name.value === 'email' ? 'Old email' : 'Deadname'}
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
                      nameCategory: name.value,
                      index,
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                      names: $state.snapshot(settings.names) as Names,
                    })
                  }}
                />
                <input
                  type="text"
                  class="input border rounded peer"
                  placeholder={name.value === 'email' ? 'New email' : 'Proper name'}
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
                      nameCategory: name.value,
                      index,
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                      names: $state.snapshot(settings.names) as Names,
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

<style>
  :global {
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
  }
</style>
