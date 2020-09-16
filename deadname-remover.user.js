// ==UserScript==
// @name         Deadname-Remover
// @version      1.1.0
// @description  Replace dead names with preffered names.
// @author       William Hayward
// @license      MIT
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @namespace    https://github.com/WillHayCode/Deadname-Remover
// @supportURL   https://github.com/WillHayCode/Deadname-Remover/issues
// @updateURL    https://github.com/WillHayCode/Deadname-Remover/blob/master/deadname-remover.meta.js
// @downloadURL  https://github.com/WillHayCode/Deadname-Remover/blob/master/deadname-remover.user.js
// ==/UserScript==

(function() {
	'use strict';
	var settings = 	{
		name: {
			first: "",
			middle: "",
			last: ""
		},
		deadname: {
			first: "",
			middle: "",
			last: ""
		},
		enabled: true
	}
	!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.DeadnameRemover=t():e.DeadnameRemover=t()}(window,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(1),o=n(2),i=null,l=null;function d(){var e=[],t=[];if(0!==i.first.length&&0!==l.first.length&&0!==i.middle.length&&0!==l.middle.length&&0!==i.last.length&&0!==l.last.length){var n=i.first+" "+i.middle+" "+i.last,r=l.first+" "+l.middle+" "+l.last;e.push(n),t.push(r)}0!==i.first.length&&0!==l.first.length&&(e.push(i.first),t.push(l.first)),0!==i.last.length&&0!==l.last.length&&(e.push(i.last),t.push(l.last)),function(e,t){for(var n=[],r=0,i=e.length;r<i;r++)n.push(new RegExp("\\b"+e[r]+"\\b","gi"));if(o.isDOMReady()){for(r=0,i=n.length;r<i;r++)document.title=document.title.replace(n[r],t[r]);u(n,t)}else o.addDOMReadyListener((function(){for(var e=0,r=n.length;e<r;e++)document.title=document.title.replace(n[e],t[e]);u(n,t)}))}(t,e)}function a(e,t,n){if(3===e.nodeType)for(var r=0,o=t.length;r<o;r++){var i=e.nodeValue,l=i.replace(t[r],n[r]);l!==i&&e.parentElement&&e.parentElement.replaceChild(document.createTextNode(l),e)}else if(e.hasChildNodes())for(r=0,o=e.childNodes.length;r<o;r++)a(e.childNodes[r],t,n)}function u(e,t){for(var n=document.body.getElementsByTagName("*"),r=0,o=n.length;r<o;r++)for(var i=n[r].childNodes,l=0,d=i.length;l<d;l++)a(i[l],e,t);!function(e,t){new MutationObserver((function(n){for(var r=0,o=n.length;r<o;r++){var i=n[r];"childList"===i.type&&i.addedNodes.forEach((function(n){a(n,e,t)}))}})).observe(document,{childList:!0,subtree:!0})}(e,t)}t.start=function(e){void 0===e&&(e=r.DEFAULT_SETTINGS),console.log("Starting."),e.enabled&&(null===i||null===l?function(e){i=e.name,l=e.deadname,d()}(e):d())}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.DEFAULT_SETTINGS={name:{first:"",middle:"",last:""},deadname:{first:"",middle:"",last:""},enabled:!0}},function(e,t,n){"use strict";function r(){return"complete"===document.readyState||"interactive"===document.readyState}Object.defineProperty(t,"__esModule",{value:!0}),t.isDOMReady=r;var o=new Set;if(t.addDOMReadyListener=function(e){o.add(e)},!r()){var i=function(){r()&&(document.removeEventListener("readystatechange",i),o.forEach((function(e){return e()})),o.clear())};document.addEventListener("readystatechange",i)}}])}));
	DeadnameRemover.start(settings);
})();
