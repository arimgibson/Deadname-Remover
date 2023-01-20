const { build } = require('esbuild');
const { clean, files, copyFiles } = require('./utils');

async function production() {
  await clean();
  await copyFiles();

  files.forEach(async (options) => {
    await build({
      entryPoints: [options.src],
      outfile: options.out,
      format: 'iife',
      minifySyntax: true,
      bundle: true,
      sourcemap: false,
      charset: 'utf8',
      treeShaking: true,
    });
  });
}

module.exports = {
  production,
};
