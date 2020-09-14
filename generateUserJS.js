const fs = require('fs');
const pjson = require('./package.json');

const fileData = fs.readFileSync('build\\api.js', {encoding: 'utf8'});
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
    `\tvar settings = {`,
    '\t\tname: {',
    '\t\t\tfirst: "",',
    '\t\t\tmiddle: "",',
    '\t\t\tlast: "",',
    '\t\t},',
    '\t\tdeadname: {',
    '\t\t\tfirst: "",',
    '\t\t\tmiddle: "",',
    '\t\t\tlast: "",',
    '\t\t},',
    '\t\tenabled: true',
    '\t}',
    `\t${fileData}`,
    '\tDeadnameRemover.start(settings);',
    '})();',
    ''
].join('\n');
fs.writeFileSync('api.js', data, {encoding: 'utf8'});