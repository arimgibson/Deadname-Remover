import { handleNode } from './replace';

// Based off https://stackoverflow.com/questions/5904914/javascript-regex-to-replace-text-not-in-html-attributes/5904945#5904945
export default function walk(node: Document | Node): void {
  let child;
  let next;

  switch (node.nodeType) {
    case 1: // Element
    case 9: // Document
    case 11: // Document fragment
      child = node.firstChild ?? (node as Element).shadowRoot;
      while (child) {
        next = child.nextSibling;
        walk(child);
        child = next;
      }
      break;
    case 3: // Text node
      handleNode(node);
      break;
    default: break;
  }
  // eslint-disable-next-line no-useless-return
  return;
  // needed so the content script doesn't continue until walking is finished
  // i.e. ensures that content script runs synchronously
}