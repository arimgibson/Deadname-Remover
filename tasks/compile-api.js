const {build} = require('esbuild');
const fs = require('fs-extra');
const pjson = require('../package.json');
const types = require('../types');

async function api() {
    await fs.remove('deadname-remover.require.js');
    await fs.remove('deadname-remover.meta.js');
    await fs.remove('deadname-remover.user.js');

    const settings = JSON.stringify(types.DEFAULT_SETTINGS, null, '\t').split('\n');
    for (let x = 0, len = settings.length; x < len; x++) {
        settings[x] = `\t${settings[x].replace(/.+?(?=\:)/g, (m$) => {
            return m$.replace(/\"/g, '');
        })}`;
    }

    await build({
        entryPoints: ['src/inject/inject.ts'],
        outfile: 'deadname-remover.require.js',
        format: 'iife',
        globalName: 'DeadnameRemover',
        minify: true,
        bundle: true,
        sourcemap: false,
    });

    const indent = ' '.repeat(4);

    const data = [
        '// ==UserScript==',
        '// @name         Deadname-Remover',
        `// @version      ${pjson.version}`,
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
        `${indent}var settings = ${settings.join('\n')}`,
        `${indent}DeadnameRemover.start(settings);`,
        '})();',
        ''
    ].join('\n');
    await fs.writeFile('deadname-remover.user.js', data, {encoding: 'utf8'});

    const metaData = [
        '// ==UserScript==',
        '// @name        Deadname-Remover',
        `// @version     ${pjson.version}`,
        '// @namespace   https://github.com/WillHayCode/Deadname-Remover',
        '// ==/UserScript==',
        ''
    ].join('\n');
    await fs.writeFile('deadname-remover.meta.js', metaData, {encoding: 'utf8'});

    await fs.remove('types.js');
}

api();

