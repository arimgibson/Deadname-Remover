/* eslint-disable import/no-extraneous-dependencies, no-console */
import { build } from 'esbuild';
import chalk from 'chalk';

const args = process.argv.slice(2);

const argWatch = args.includes('--watch') ? {
  onRebuild(error) {
    if (error) console.error(chalk.redBright('ESBuild Watch Build Failed', error));
    else console.log(chalk.greenBright('ESBuild Watch Build Succeeded'));
  },
} : false;

build({
  bundle: true,
  entryPoints: [
    './src/background.ts',
    './src/content.ts',
  ],
  format: 'iife',
  minify: true,
  outdir: 'dist',
  platform: 'browser',
  watch: argWatch,
}).then(() => {
  if (argWatch) console.log('ESBuild: Watching...');
});
