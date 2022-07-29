import { remove, copy } from 'fs-extra';

async function clean() {
    await remove('dist/');
}

async function copyFiles() {
    await copy('assets/', 'dist/');
    await copy('html/', 'dist/popup/');
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
    },
    {
        src: 'src/popup/stealth.ts',
        out: 'dist/popup/stealth.js',
    }
];


export default {
    clean,
    files,
    copyFiles,
};
