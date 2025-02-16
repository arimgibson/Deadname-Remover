import { defineConfig } from 'unocss'
import { presetOnu } from '@onu-ui/preset'

export default defineConfig({
  shortcuts: {
    'input-error': '[.peer[aria-invalid=true]~&]:block hidden',
    'name-pair-row-grid': 'grid grid-cols-[47%_47%_6%]',
    'link': 'text-primary hover:text-primary-600 underline hover:underline-offset-4 transition-all',
    'right-tooltip': 'absolute left-full top-1/2 -translate-y-1/2 ml-2 w-max px-3 py-2 bg-white text-gray-700 rounded shadow-xl',
  },
  presets: [
    presetOnu({
      color: '#8B5CF6',
    }),
  ],
  theme: {
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
