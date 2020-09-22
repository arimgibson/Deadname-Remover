import {UserSettings, DEFAULT_SETTINGS} from '../types';
import {addDOMReadyListener, isDOMReady} from './dom';

let alivename = null;
let deadname = null;
let alivenames = null;
let deadnames = null;
let observer: MutationObserver = null;

export function start(settings: UserSettings = DEFAULT_SETTINGS) {
    console.log('Starting.');
    cleanUp();
    if (!settings.enabled) {
        return;
    }
    loadNames(settings);
}

function cleanUp() {
    if (alivenames === null || deadnames === null) {
        return;
    }
    observer && observer.disconnect();
    replaceNames(alivenames, deadnames);
    observer && observer.disconnect();

}

function loadNames(settings: UserSettings) {
    alivename = settings.name;
    deadname = settings.deadname;
    changeContent();
}

function changeContent() {
    alivenames = [];
    deadnames = [];
    if (alivename.first && deadname.first &&
        alivename.middle && deadname.middle &&
        alivename.last && deadname.last) {
        const fullAlive = `${alivename.first} ${alivename.middle} ${alivename.last}`;
        const fullDead = `${deadname.first} ${deadname.middle} ${deadname.last}`;
        alivenames.push(fullAlive);
        deadnames.push(fullDead);
    }
    if (alivename.first && deadname.first) {
        alivenames.push(alivename.first);
        deadnames.push(deadname.first);
    }

    if (alivename.last && deadname.last) {
        alivenames.push(alivename.last);
        deadnames.push(deadname.last);
    }
    replaceNames(deadnames, alivenames);
}

function checkNodeForReplacement(node: Node, dead: RegExp[], replacement: string[]) {
    if (node.nodeType === 3) {
        for (let i = 0, len = dead.length; i < len; i++) {
            const text = node.nodeValue;
            const newText = text.replace(dead[i], replacement[i]);
            if (newText !== text) {
                node.parentElement && node.parentElement.replaceChild(document.createTextNode(newText), node);
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

function setupListener(dead: RegExp[], replacement: string[]) {
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

function checkElementForTextNodes(dead: RegExp[], replacement: string[]) {
    const elements = document.body.getElementsByTagName('*');
    for (let i = 0, len = elements.length; i < len; i++) {
        const children = elements[i].childNodes;
        for (let n = 0, len2 = children.length; n < len2; n++) {
            checkNodeForReplacement(children[n], dead, replacement);
        }
    }
    setupListener(dead, replacement);
}

function replaceNames(old: string[], replacement: string[]) {
    const dead = [];
    for (let i = 0, len = old.length; i < len; i++) {
        dead.push(new RegExp('\\b' + old[i] + '\\b', 'gi'));
    }
    if (!isDOMReady()) {
        addDOMReadyListener(() => {
            for (let i = 0, len = dead.length; i < len; i++) {
                document.title = document.title.replace(dead[i], replacement[i]);
            }
            checkElementForTextNodes(dead, replacement);
        });
    } else {
        for (let i = 0, len = dead.length; i < len; i++) {
            document.title = document.title.replace(dead[i], replacement[i]);
        }
        checkElementForTextNodes(dead, replacement);
    }
}
