import {UserSettings, DEFAULT_SETTINGS, Name} from '../types';
import {addDOMReadyListener, isDOMReady} from './dom';

let alivename: Name = null;
let deadname: Name[] = null;
let alivenames: string[] = [];
let deadnames: string[] = [];
let observer: MutationObserver = null;
const cachedNames = new Map<string, string>();
let revert = false;
let highlight: boolean;

export function start(settings: UserSettings = DEFAULT_SETTINGS) {
    console.log('Starting.');
    cleanUp();
    if (!settings.enabled) {
        return;
    }
    highlight = settings.highlight;
    loadNames(settings);
}

function cleanUp() {
    if (alivenames.length === 0 || deadnames.length === 0) {
        return;
    }
    observer && observer.disconnect();
    revert = true;
    replaceNames(alivenames, deadnames);
    observer && observer.disconnect();
    revert = false;
    cachedNames.clear();

}

function loadNames(settings: UserSettings) {
    alivename = settings.name;
    deadname = settings.deadname;
    changeContent();
}

function changeContent() {
    alivenames = [];
    deadnames = [];
    const isAliveNameFirst = Boolean(alivename.first);
    const isAliveNameMiddle = Boolean(alivename.middle);
    const isAliveNameLast = Boolean(alivename.last);
    for (let x = 0, len = deadname.length; x < len; x++) {
        const isDeadNameFirst = Boolean(deadname[x].first);
        const isDeadNameMiddle = Boolean(deadname[x].middle);
        const isDeadNameLast = Boolean(deadname[x].last);
        if (
            isAliveNameFirst && isDeadNameFirst &&
            isAliveNameMiddle && isDeadNameMiddle &&
            isAliveNameLast && isDeadNameLast
        ) {
            const fullAlive = `${alivename.first} ${alivename.middle} ${alivename.last}`;
            const fullDead = `${deadname[x].first} ${deadname[x].middle} ${deadname[x].last}`;
            alivenames.push(fullAlive);
            deadnames.push(fullDead);
        }

        if (isAliveNameFirst && isDeadNameFirst) {
            alivenames.push(alivename.first);
            deadnames.push(deadname[x].first);
        }

        if (isDeadNameMiddle) {
            alivenames.push(isAliveNameMiddle ? alivename.middle : '');
            deadnames.push(deadname[x].middle);
        }

        if (isAliveNameLast && isDeadNameLast) {
            alivenames.push(alivename.last);
            deadnames.push(deadname[x].last);
        }

        if (
            isAliveNameFirst && isDeadNameFirst &&
            isAliveNameLast && isDeadNameLast
        ) {
            alivenames.push(alivename.first + alivename.last);
            deadnames.push(deadname[x].first + deadname[x].last);
        }
    }
    replaceNames(deadnames, alivenames);
}

const acceptableCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

function replaceText(orginialText: string, oldText: string, newText: string, isTitle?: boolean) {
    if (oldText === newText) {
        return orginialText;
    }
    if (!revert && highlight && !isTitle) {
        newText = `<span style="background: linear-gradient(to right, #55CDFC 20%, #F7A8B8 0%, #F7A8B8 40%, white 0%, white 60%, #F7A8B8 0%, #F7A8B8 80%, #55CDFC 0%)" replaced="">${newText}</span>`;
    }
    let replacementText = orginialText;
    oldText = oldText.toLowerCase();
    if (revert && highlight && !isTitle) {
        oldText = `<span style="background: linear-gradient(to right, #55CDFC 20%, #F7A8B8 0%, #F7A8B8 40%, white 0%, white 60%, #F7A8B8 0%, #F7A8B8 80%, #55CDFC 0%)" replaced="">${oldText}</span>`;
    }
    const oldTextLen = oldText.length;
    let index = replacementText.toLowerCase().indexOf(oldText);
    while (index !== -1) {
        const end = index + oldTextLen;
        if (acceptableCharacters.indexOf(replacementText[end]) === -1 && acceptableCharacters.indexOf(replacementText[index - 1]) === -1) {
            replacementText = replacementText.substring(0, index) + newText + replacementText.substring(end);
        }
        index = replacementText.toLocaleLowerCase().indexOf(oldText, end);
    }
    return replacementText;
}

function checkNodeForReplacement(node: Node, dead: string[], replacement: string[]) {
    if (!node || (!revert && node['replaced'])) {
        return;
    }
    if (revert) {
        if (highlight) {
            const cachedText = cachedNames.get((node as HTMLElement).innerHTML);
            if (cachedText) {
                (node as HTMLElement).innerHTML = cachedText.toString();
            }
        } else {
            const cachedText = cachedNames.get(node.nodeValue);
            if (cachedText) {
                node.parentElement && node.parentElement.replaceChild(document.createTextNode(cachedText.toString()), node);
            }
        }
        return;
    }
    if (node.nodeType === 3) {
        const oldText = node.nodeValue;
        let newText = node.nodeValue;
        for (let i = 0, len = dead.length; i < len; i++) {
            newText = replaceText(newText, dead[i], replacement[i]);
        }
        if (newText !== oldText) {
            cachedNames.set(newText, oldText);
            if (node.parentElement) {
                node.parentElement.innerHTML = newText;
            }
        }
    } else if (node.hasChildNodes()) {
        for (let i = 0, len = node.childNodes.length; i < len; i++) {
            checkNodeForReplacement(node.childNodes[i], dead, replacement);
        }
    }
}

function setupListener(dead: string[], replacement: string[]) {
    observer = new MutationObserver((mutations: Array<MutationRecord>) => {
        for (let i = 0, len = mutations.length; i < len; i++) {
            const mutation: MutationRecord = mutations[i];
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node: Node) => {
                    checkNodeForReplacement(node, dead, replacement);
                });
            }
        }
    });
    observer.observe(document, {childList: true, subtree: true});
}

function checkElementForTextNodes(dead: string[], replacement: string[]) {
    if (revert && highlight) {
        const elements = document.body.querySelectorAll('mark[replaced]');
        for (let i = 0, len = elements.length; i < len; i++) {
            checkNodeForReplacement(elements[i].parentElement, dead, replacement);
        }
    }
    const iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
    let currentTextNode: Node;
    while (currentTextNode = iterator.nextNode()) {
        checkNodeForReplacement(currentTextNode, dead, replacement);
    }
    if (!revert) {
        setupListener(dead, replacement);
    }
}

function replaceNames(old: string[], replacement: string[]) {
    if (!isDOMReady()) {
        addDOMReadyListener(() => {
            for (let i = 0, len = old.length; i < len; i++) {
                document.title = replaceText(document.title, old[i], replacement[i], true);
            }
            checkElementForTextNodes(old, replacement);
        });
    } else {
        for (let i = 0, len = old.length; i < len; i++) {
            document.title = replaceText(document.title, old[i], replacement[i], true);
        }
        checkElementForTextNodes(old, replacement);
    }
}
