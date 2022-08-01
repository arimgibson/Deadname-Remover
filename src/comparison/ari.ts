import { names, deadnames } from './shared';

// Parse through elements, choose which ones to change and which to keep
const elements = [...document.getElementsByTagName('*')];
const badElementTags = ['HEAD', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'META'];
const noBackgroundTags = ['TITLE', 'INPUT'];
const inputs = [...document.querySelectorAll('input[type=text]')];

elements.forEach((elem) => {
  if (!badElementTags.includes(elem.nodeName) && elem.childNodes.length > 0) {
    [...elem.childNodes].forEach((node) => {
      if (node.nodeType === 3) { nameReplace(node, firstName); }
    });
  }
});

inputs.forEach((node) => {
  nameReplace(node, firstName, 1);
});

function nameReplace(node, regexPattern, altField?) {
  let html;
  if (altField) {
    html = node.value.replace(regexPattern, (match) => {
      node.parentNode.classList.add('ADR-2918');
      return matchCase(match, names[match.toLowerCase()]);
    });
    node.value = html;
  } else {
    html = node.nodeValue.replace(regexPattern, (match) => (!noBackgroundTags.includes(node.parentNode.nodeName) ? `<mark class="ADR-2918">${matchCase(match, names[match.toLowerCase()])}</mark>` : `${matchCase(match, names[match.toLowerCase()])}`));
    const div = document.createElement('div');
    node.parentNode.insertBefore(div, node);
    div.insertAdjacentHTML('afterend', html);
    div.remove();
    node.remove();
  }
}

function matchCase(match, replacement) {
  switch (match) {
    case match.toUpperCase():
      return replacement.toUpperCase();
    case match.toLowerCase():
      return replacement.toLowerCase();
    default:
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
}
