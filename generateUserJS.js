const fs = require('fs');
const pjson = require('./package.json');
const types = require('./build/Types');

const fileData = fs.readFileSync('build\\api.js', {encoding: 'utf8'});
let settings = JSON.stringify(types.DEFAULT_SETTINGS, null, '\t').split('\n')
for (let x = 0, len = settings.length; x < len; x++) {
    settings[x] = `\t${settings[x].replace(/.+?(?=\:)/g, (m$) => {
        return m$.replace(/\"/g, '')
    })}`;
}
const data = [
    '// ==UserScript==',
    '// @name         Deadname-Remover',
    `// @version      ${pjson.version}`,
    '// @description  Replace dead names with preffered names.',
    '// @author       William Hayward',
    '// @match        *://*/*',
    '// @grant        none',
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
fs.writeFileSync('api.js', data, {encoding: 'utf8'});
