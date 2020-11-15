const {build} = require('esbuild');

async function generateType() {
    await build({
        entryPoints: ['src/types.ts'],
        outfile: 'types.js',
        format: 'cjs',
        sourcemap: false,
        minify: false,
        bundle: false,
    });
}

generateType();
