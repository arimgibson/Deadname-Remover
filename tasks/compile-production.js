const {build} = require('esbuild');
const {clean, files, copyFiles} = require('./utils');

async function production() {
    await clean();
    await copyFiles();

    files.forEach(async (options) => {
        await build({
            entryPoints: [options.src],
            outfile: options.out,
            format: 'iife',
            minify: true,
            bundle: true,
            sourcemap: false,
        });
    });
}

module.exports = {
    production,
};
