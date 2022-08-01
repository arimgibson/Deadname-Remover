function matchCase(match, replacement): string {
  switch (match) {
    case match.toUpperCase():
      return replacement.toUpperCase();
    case match.toLowerCase():
      return replacement.toLowerCase();
    default:
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
}

function handleText(textNode) {
  textNode.nodeValue = matchCase(match, textNode.nodeValue.replace(/ari/gi, 'Arianna')); // eslint-disable-line
  textNode.nodeValue = textNode.nodeValue.replace(/gibson/gi, 'Greene'); // eslint-disable-line
  matchCase(textNode);
}

export default function walk(node: Document):void {
  let child; let
    next;

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
    default:
      break;
  }
}
