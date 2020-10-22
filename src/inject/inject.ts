import {UserSettings, DEFAULT_SETTINGS, Name} from '../types';
import {addDOMReadyListener, isDOMReady} from './dom';

let alivename: Name = null;
let deadname: Name[] = null;
let alivenames: string[] = [];
let deadnames: string[] = [];
let observer: MutationObserver = null;
const cachedNames = new Map<string, string>();
let revert = false;

export function start(settings: UserSettings = DEFAULT_SETTINGS) {
    console.log('Starting.');
    cleanUp();
    if (!settings.enabled) {
        return;
    }
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
    for (let x = 0, len = deadname.length; x < len; x++) {
        if (alivename.first && deadname[x].first &&
        alivename.middle && deadname[x].middle &&
        alivename.last && deadname[x].last) {
            const fullAlive = `${alivename.first} ${alivename.middle} ${alivename.last}`;
            const fullDead = `${deadname[x].first} ${deadname[x].middle} ${deadname[x].last}`;
            alivenames.push(fullAlive);
            deadnames.push(fullDead);
        }
        if (alivename.first && deadname[x].first) {
            alivenames.push(alivename.first);
            deadnames.push(deadname[x].first);
        }

        if (deadname[x].middle) {
            alivenames.push(alivename.middle ? alivename.middle : '');
            deadnames.push(deadname[x].middle);
        }

        if (alivename.last && deadname[x].last) {
            alivenames.push(alivename.last);
            deadnames.push(deadname[x].last);
        }
    }
    replaceNames(deadnames, alivenames);
}

const acceptableCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

function replaceText(orginialText: string, oldText: string, newText: string) {
    let replacementText = orginialText;
    orginialText = orginialText.toLowerCase();
    oldText = oldText.toLowerCase();
    let index: number = orginialText.indexOf(oldText);
    while (index != -1) {
        if (acceptableCharacters.indexOf(orginialText[index + oldText.length]) == -1 && acceptableCharacters.indexOf(orginialText[index - 1]) == -1) {
            replacementText = orginialText.replace(oldText, newText);
        }
        orginialText = orginialText.replace(oldText, newText);
        index = orginialText.indexOf(oldText);
    }
    return replacementText;
}

function checkNodeForReplacement(node: Node, dead: string[], replacement: string[]) {
    if (node.nodeType === 3) {
        for (let i = 0, len = dead.length; i < len; i++) {
            if (revert) {
                const cachedText = cachedNames.get(node.nodeValue);
                if (cachedText) {
                    node.parentElement && node.parentElement.replaceChild(document.createTextNode(cachedText.toString()), node);
                }
            } else {
                const text = node.nodeValue;
                const newText = replaceText(text, dead[i], replacement[i]);
                if (newText !== text) {
                    cachedNames.set(newText, text);
                    node.parentElement && node.parentElement.replaceChild(document.createTextNode(newText), node);
                }
            }
        }
    } else {
        if (node.hasChildNodes()) {
            for (let i = 0, len = node.childNodes.length; i < len; i++) {
                checkNodeForReplacement(node.childNodes[i], dead, replacement);
            }
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
    const elements = document.body.getElementsByTagName('*');
    for (let i = 0, len = elements.length; i < len; i++) {
        const children = elements[i].childNodes;
        for (let n = 0, len2 = children.length; n < len2; n++) {
            checkNodeForReplacement(children[n], dead, replacement);
        }
    }
    if (!revert) {
        setupListener(dead, replacement);
    }
}

function replaceNames(old: string[], replacement: string[]) {
    if (!isDOMReady()) {
        addDOMReadyListener(() => {
            for (let i = 0, len = old.length; i < len; i++) {
                document.title = replaceText(document.title, old[i], replacement[i]);
            }
            checkElementForTextNodes(old, replacement);
        });
    } else {
        for (let i = 0, len = old.length; i < len; i++) {
            document.title = replaceText(document.title, old[i], replacement[i]);
        }
        checkElementForTextNodes(old, replacement);
    }
}
