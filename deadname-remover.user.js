// ==UserScript==
// @name         Deadname-Remover
// @version      1.1.2
// @description  Replace dead names with preferred names.
// @author       William Hayward & Ari Gibson
// @license      MIT
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @namespace    https://github.com/arimgibson/Deadname-Remover
// @supportURL   https://github.com/arimgibson/Deadname-Remover/issues
// @require      https://github.com/arimgibson/Deadname-Remover/raw/main/deadname-remover.require.js
// @updateURL    https://github.com/arimgibson/Deadname-Remover/raw/main/deadname-remover.meta.js
// @downloadURL  https://github.com/arimgibson/Deadname-Remover/raw/main/deadname-remover.user.js
// ==/UserScript==

(function() {
    'use strict';
    const settings = 	{
		name: {
			first: "",
			middle: "",
			last: ""
		},
		deadname: [
			{
				first: "",
				middle: "",
				last: ""
			}
		],
		enabled: true,
		stealthMode: false,
		highlight: false,
		ignoreCase: true
	}
    DeadnameRemover.start(settings);
})();
