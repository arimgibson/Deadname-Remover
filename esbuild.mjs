/* eslint-disable import/no-extraneous-dependencies, no-console */
import { build } from 'esbuild';
import chalk from 'chalk';

const args = process.argv.slice(2);

if (!args.includes('--dev') && !args.includes('--prod')) {
  console.error(chalk.red('No *default* build command\nDid you mean build:dev or build:prod?'));
  process.exit(1);
}

const argWatch = args.includes('--watch') ? {
  onRebuild(error) {
    if (error) console.error(chalk.redBright('ESBuild Watch Build Failed', error));
    else console.log(chalk.greenBright('ESBuild Watch Build Succeeded'));
  },
} : false;

build({
  bundle: true,
  entryPoints: [
    // './src/background.ts',
    './src/content.ts',
  ],
  format: 'iife',
  minify: args.includes('--prod'),
  outdir: 'dist',
  platform: 'browser',
  watch: argWatch,
  sourcemap: true,
}).then(() => {
  if (argWatch) console.log('ESBuild: Watching...');
});
