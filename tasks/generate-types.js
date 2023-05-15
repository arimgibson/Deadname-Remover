import { build } from 'esbuild';

async function generateType() {
  await build({
    entryPoints: ['src/types.ts'],
    outfile: 'types.js',
    format: 'esm',
    sourcemap: false,
    minify: false,
    bundle: false,
  });
}

generateType();
