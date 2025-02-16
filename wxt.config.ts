import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  imports: false,
  modules: ['@wxt-dev/unocss', '@wxt-dev/module-svelte'],
  vite: () => ({
    resolve: {
      conditions: ['browser'],
    },
  }),
  manifest: input => ({
    key: input.browser === 'chrome'
      ? 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgttEH3/mr2y2ey2XaLPZV0y3qLABXLIt3ro/eaJTex41I3Zvy76RLQbLhgQoEkU/TfkE9OT3rif2Sc1WtndFf3GMmgmzdUwNdS1DfJOjlavNLfvei0+XJQod/s2tSR9crhSyU7IjvW6niZVMnewtol3stf7CZZvz81zaUYz1XtLQWLI2D52FZUWiZEvtF1/pRmUOJBRsLjuWPNdEEPnby5NJ+B9tbKhvQ6SaXfiOT+pmHOcunHdsL1Ys3dlww3oERX7hDCSv1ZuzjzERcbqHEo5cAA916HQ+ugUU1Fi4/k1f9xXRn8TgCvno79/pmRO1WFDtnDW6/p1LdQDAmZnunwIDAQAB'
      : undefined,
    browser_specific_settings: {
      // ID is static and can't be changed
      gecko: {
        id: 'deadname-remover@willhaycode.com',
        strict_min_version: '57.0',
      },
    },
    icons: {
      16: 'icon/trans16.png',
      32: 'icon/trans32.png',
      48: 'icon/trans48.png',
      128: 'icon/trans128.png',
    },
    permissions: ['storage'],
    action: {
      default_icon: 'icon/trans16.png',
      default_popup: 'popup.html',
      default_title: 'Deadname Remover Settings',
    },
    author: input.browser === 'chrome'
      ? { email: 'hi@arimgibson.com' }
      : 'Ari Gibson',
    homepage_url: 'https://github.com/arimgibson/Deadname-Remover',
    version: '2.0.0',
    offline_enabled: true,
  }),
})
