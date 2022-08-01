import { names, deadnames } from './shared';

function handleText(textNode) {
  textNode.nodeValue = textNode.nodeValue.replace(/ari/gi, 'Arianna'); // eslint-disable-line
  textNode.nodeValue = textNode.nodeValue.replace(/gibson/gi, 'Greene'); // eslint-disable-line
}

function walk(node) {
  let child;
  let next;

  switch (node.nodeType) {
    case 1: // Element
    case 9: // Document
    case 11: // Document fragment
      child = node.firstChild;
      while (child) {
        next = child.nextSibling;
        walk(child);
        child = next;
      }
      break;
    case 3: // Text node
      handleText(node);
      break;
    default: break;
  }
}

walk(document);
