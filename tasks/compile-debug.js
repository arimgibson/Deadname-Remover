const {build} = require('esbuild');
const {clean, files, copyFiles} = require('./utils');

async function debug() {
    await clean();
    await copyFiles();

    files.forEach(async (options) => {
        await build({
            entryPoints: [options.src],
            outfile: options.out,
            sourcemap: 'inline',
            format: 'iife',
            bundle: true,
            minify: false,
        });
    });
}

module.exports = {
    debug,
};
