const fs = require('fs-extra');

async function clean() {
    await fs.remove('dist/');
}

async function copyFiles() {
    await fs.copy('assets/', 'dist/');
    await fs.copy('html/', 'dist/popup/');
}

const files = [
    {
        src: 'src/index.ts',
        out: 'dist/inject.js',
    },
    {
        src: 'src/background/background.ts',
        out: 'dist/background.js',
    },
    {
        src: 'src/popup/options.ts',
        out: 'dist/popup/options.js',
    },
    {
        src: 'src/popup/popup.ts',
        out: 'dist/popup/popup.js',
    }
];


module.exports = {
    clean,
    files,
    copyFiles,
};
