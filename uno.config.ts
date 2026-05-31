import { defineConfig } from 'unocss'
import { presetOnu } from '@onu-ui/preset'

const fontFamily = '"Inter Variable", Inter, sans-serif'

export default defineConfig({
  shortcuts: {
    'input-error': '[.peer[aria-invalid=true]~&]:block hidden',
    'name-pair-row-grid': 'grid grid-cols-[47%_47%_6%]',
    'link': 'text-primary hover:text-primary-600 underline hover:underline-offset-4 transition-all',
    'tooltip': 'absolute top-1/2 -translate-y-1/2 w-max px-3 py-2 bg-white text-gray-700 rounded shadow-xl',
    'right-tooltip': 'tooltip left-full ml-2',
    'left-tooltip': 'tooltip right-full mr-2',
    'accessible-switch': 'switch has-[:focus-visible]:ring has-[:focus-visible]:ring-black has-[:focus-visible]:ring-offset-2',
  },
  presets: [
    presetOnu({
      // temporarily setting to a color so that the hue delta isn't 0. See https://github.com/zyyv/magic-color/issues/39
      color: '#8955F6',
      // could be more optimized to reuse bundled Fontsource fonts, not worth the time right now
      fonts: [{
        name: 'Inter Variable',
        provider: 'none',
      }],
    }),
  ],
  theme: {
    fontFamily: {
      sans: fontFamily,
    },
    animation: {
      keyframes: {
        'fade-in-right-horizontal': '{from{opacity:0;transform:translate(100%,-50%)}to{opacity:1;transform:translate(0,-50%)}}',
      },
      durations: {
        'fade-in-right-horizontal': '0.5s',
      },
      timingFns: {
        'fade-in-right-horizontal': 'ease-in',
      },
    },
  },
})
