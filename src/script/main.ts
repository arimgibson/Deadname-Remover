import parseNodes from "./parse"
import nameReplace from './replace';
import setStyle from './style';

setStyle();
const elements = parseNodes()

const names = {
  ari: 'arianna',
  greene: 'gibson',
};

const deadnames = Object.keys(names).map((i) => `\\b${i}\\b`);

const firstName = new RegExp(deadnames.join('|'), 'gi');

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
