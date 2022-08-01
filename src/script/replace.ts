export default function nameReplace(node, regexPattern, altField) {
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
