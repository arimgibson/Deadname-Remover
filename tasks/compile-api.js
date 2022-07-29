import { build } from 'esbuild';
import { remove, writeFile } from 'fs-extra';
import { version } from '../package.json';
import { DEFAULT_SETTINGS } from '../types';

async function api() {
    await remove('deadname-remover.require.js');
    await remove('deadname-remover.meta.js');
    await remove('deadname-remover.user.js');

    const settings = JSON.stringify(DEFAULT_SETTINGS, null, '\t').split('\n');
    for (let x = 0, len = settings.length; x < len; x++) {
        settings[x] = `\t${settings[x].replace(/.+?(?=:)/g, (m$) => {
            return m$.replace(/"/g, '');
        })}`;
    }

    await build({
        entryPoints: ['src/inject/inject.ts'],
        outfile: 'deadname-remover.require.js',
        format: 'iife',
        globalName: 'DeadnameRemover',
        minifySyntax: true,
        bundle: true,
        sourcemap: false,
    });

    const indent = ' '.repeat(4);

    const data = [
        '// ==UserScript==',
        '// @name         Deadname-Remover',
        `// @version      ${version}`,
        '// @description  Replace dead names with preffered names.',
        '// @author       William Hayward',
        '// @license      MIT',
        '// @match        *://*/*',
        '// @grant        none',
        '// @run-at       document-start',
        '// @namespace    https://github.com/WillHayCode/Deadname-Remover',
        '// @supportURL   https://github.com/WillHayCode/Deadname-Remover/issues',
        '// @require      https://github.com/WillHayCode/Deadname-Remover/blob/master/deadname-remover.require.js',
        '// @updateURL    https://github.com/WillHayCode/Deadname-Remover/blob/master/deadname-remover.meta.js',
        '// @downloadURL  https://github.com/WillHayCode/Deadname-Remover/blob/master/deadname-remover.user.js',
        '// ==/UserScript==',
        '',
        '(function() {',
        `${indent}'use strict';`,
        `${indent}const settings = ${settings.join('\n')}`,
        `${indent}DeadnameRemover.start(settings);`,
        '})();',
        ''
    ].join('\n');
    await writeFile('deadname-remover.user.js', data, {encoding: 'utf8'});

    const metaData = [
        '// ==UserScript==',
        '// @name        Deadname-Remover',
        `// @version     ${version}`,
        '// @namespace   https://github.com/WillHayCode/Deadname-Remover',
        '// ==/UserScript==',
        ''
    ].join('\n');
    await writeFile('deadname-remover.meta.js', metaData, {encoding: 'utf8'});

    await remove('types.js');
}

api();

