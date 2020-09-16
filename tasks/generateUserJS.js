const fs = require('fs');
const path = require('path');
const pjson = require('../package.json');
const types = require('../build/Types');

const fileData = fs.readFileSync(path.join(__dirname, '..', 'build', 'api.js'), {encoding: 'utf8'});
const settings = JSON.stringify(types.DEFAULT_SETTINGS, null, '\t').split('\n');
for (let x = 0, len = settings.length; x < len; x++) {
    settings[x] = `\t${settings[x].replace(/.+?(?=\:)/g, (m$) => {
        return m$.replace(/\"/g, '');
    })}`;
}
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
    '// @updateURL    https://github.com/WillHayCode/Deadname-Remover/blob/master/deadname-remover.meta.js',
    '// @downloadURL  https://github.com/WillHayCode/Deadname-Remover/blob/master/deadname-remover.user.js',
    '// ==/UserScript==',
    '',
    '(function() {',
    "\t'use strict';",
    `\tvar settings = ${settings.join('\n')}`,
    `\t${fileData}`,
    '\tDeadnameRemover.start(settings);',
    '})();',
    ''
].join('\n');
fs.writeFileSync('deadname-remover.user.js', data, {encoding: 'utf8'});

const metaData = [
    '// ==UserScript==',
    '// @name        Deadname-Remover',
    `// @version     ${pjson.version}`,
    '// @namespace   https://github.com/WillHayCode/Deadname-Remover',
    '// ==/UserScript==',
    ''
].join('\n');
fs.writeFileSync('deadname-remover.meta.js', metaData, {encoding: 'utf8'});
