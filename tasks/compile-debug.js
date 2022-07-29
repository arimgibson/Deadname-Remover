import { build } from 'esbuild';
import { clean, files, copyFiles } from './utils';

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
            minifySyntax: true,
            charset: 'utf8',
            treeShaking: true,
        });
    });
}

export default {
    debug,
};
