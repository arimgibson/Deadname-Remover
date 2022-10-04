import { defineConfig } from 'cypress'; // eslint-disable-line import/no-extraneous-dependencies
import { exec } from 'child_process';

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      exec('pnpm build:prod');
      on('before:browser:launch', (browser, launchOptions) => {
        launchOptions.extensions.push('./dist');
      });
    },
  },
});
