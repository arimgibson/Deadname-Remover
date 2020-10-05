const {build} = require('esbuild');
const {clean, files, copyFiles} = require('./utils');

async function production() {
    await clean();

    files.forEach(async (options) => {
        await build({
            entryPoints: [options.src],
            outfile: options.out,
            format: 'iife',
            minify: true,
            bundle: true,
            strict: true,
            sourcemap: false,
        });
    });

    await copyFiles();
}

module.exports = {
    production,
};
