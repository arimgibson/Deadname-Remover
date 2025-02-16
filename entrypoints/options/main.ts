import 'virtual:uno.css'
import { mount } from 'svelte'
import App from './App.svelte'

const app = mount(App, {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  target: document.getElementById('app')!,
})

export default app
