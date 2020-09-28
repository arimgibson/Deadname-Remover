const {build} = require('esbuild');
const {clean, files, copyFiles} = require('./utils');

async function debug() {
    await clean();

    files.forEach(async (options) => {
        await build({
            entryPoints: [options.src],
            outfile: options.out,
            sourcemap: 'inline',
            format: 'iife',
            bundle: true,
            strict: true,
            minify: false,
        });
    });

    await copyFiles();
}

module.exports = {
    debug,
};
