import {UserSettings, DEFAULT_SETTINGS, Name} from '../types';
import {domAction} from './dom';

const cachedWords = new Map<string, string>();
let observer: MutationObserver = null;
let aliveName: Name = null;
let deadName: Name[] = null;
let newWords: string[] = [];
let oldWords: string[] = [];
let revert = false;
let highlight: boolean;

export function start(settings: UserSettings = DEFAULT_SETTINGS) {
    cleanUp();
    if (!settings.enabled) {
        return;
    }
    highlight = settings.highlight;
    aliveName = settings.name;
    deadName = settings.deadname;
    initalizeWords();
    replaceDOMWithNewWords();
}

function cleanUp() {
    if (newWords.length === 0 || oldWords.length === 0) {
        return;
    }
    observer && observer.disconnect();
    revert = true;
    [newWords, oldWords] = [oldWords, newWords];
    replaceDOMWithNewWords();
    [newWords, oldWords] = [oldWords, newWords];
    revert = false;
    cachedWords.clear();

}

function initalizeWords() {
    newWords = [];
    oldWords = [];
    const isAliveNameFirst = !!aliveName.first;
    const isAliveNameMiddle = !!aliveName.middle;
    const isAliveNameLast = !!aliveName.last;
    for (let x = 0, len = deadName.length; x < len; x++) {
        const isDeadNameFirst = !!deadName[x].first;
        const isDeadNameMiddle = !!deadName[x].middle;
        const isDeadNameLast = !!deadName[x].last;
        if (
            isAliveNameFirst && isDeadNameFirst &&
            isAliveNameMiddle && isDeadNameMiddle &&
            isAliveNameLast && isDeadNameLast
        ) {
            const fullAlive = `${aliveName.first} ${aliveName.middle} ${aliveName.last}`;
            const fullDead = `${deadName[x].first} ${deadName[x].middle} ${deadName[x].last}`;
            newWords.push(fullAlive);
            oldWords.push(fullDead);
        }

        if (isAliveNameFirst && isDeadNameFirst) {
            newWords.push(aliveName.first);
            oldWords.push(deadName[x].first);
        }

        if (isDeadNameMiddle) {
            newWords.push(isAliveNameMiddle ? aliveName.middle : '');
            oldWords.push(deadName[x].middle);
        }

        if (isAliveNameLast && isDeadNameLast) {
            newWords.push(aliveName.last);
            oldWords.push(deadName[x].last);
        }

        if (
            isAliveNameFirst && isDeadNameFirst &&
            isAliveNameLast && isDeadNameLast
        ) {
            newWords.push(aliveName.first + aliveName.last);
            oldWords.push(deadName[x].first + deadName[x].last);
        }
    }
}

const acceptableCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

function replaceText(text: string, isTitle?: boolean) {
    let currentIndex = 0;
    let index: number, end: number;
    const getIndex = (searchString: string, position?: number) => index = text.toLowerCase().indexOf(searchString, position);
    const getNextIndex = (position: number) => {
        index = getIndex(oldWords[currentIndex], position);
        while (index === -1) {
            if (currentIndex + 1 === oldWords.length) {
                return false;
            } else {
                currentIndex++;
                index = getIndex(oldWords[currentIndex]);
            }
        }
        return true;
    };
    oldWords = oldWords.map(oldText => oldText.toLowerCase());
    if (highlight && !isTitle) {
        if (revert) {
            // Avoid wrapping text in mark tags if it is already wrapped
            oldWords = oldWords.map(text =>
                /^<mark replaced="">[\s\S]*<\/mark>$/.test(text) ? text : `<mark replaced="">${text}</mark>`);
        } else {
            // Avoid wrapping text in mark tags if it is already wrapped
            newWords = newWords.map(text =>
                /^<mark replaced="">[\s\S]*<\/mark>$/.test(text) ? text : `<mark replaced="">${text}</mark>`);
        }
    }
    const oldTextsLen = oldWords.map(word => word.length);
    while (getNextIndex(end)) {
        end = index + oldTextsLen[currentIndex];
        if (acceptableCharacters.indexOf(text[end]) === -1 && acceptableCharacters.indexOf(text[index - 1]) === -1) {
            text = text.substring(0, index) + newWords[currentIndex] + text.substring(end);
        }
    }
    return text;
}

function checkNodeForReplacement(node: Node) {
    if (!node || (!revert && node['replaced'])) {
        return;
    }
    if (revert) {
        if (highlight) {
            const cachedText = cachedWords.get((node as HTMLElement).innerHTML);
            if (cachedText) {
                node.parentElement && node.parentElement.replaceChild(document.createTextNode(cachedText.toString()), node);
            }
        } else {
            const cachedText = cachedWords.get(node.nodeValue);
            if (cachedText) {
                node.parentElement && node.parentElement.replaceChild(document.createTextNode(cachedText.toString()), node);
            }
        }
        return;
    }
    if (node.nodeType === 3) {
        const oldText = node.nodeValue;
        let newText = node.nodeValue;
        newText = replaceText(newText, false);
        if (newText !== oldText) {
            cachedWords.set(newText, oldText);
            if (highlight) {
                if (node.parentElement) {
                    const elem = document.createElement('span');
                    node.parentElement.replaceChild(elem, node);
                    elem.outerHTML = newText;
                }
            }
            else {
                node.nodeValue = newText;
            }
        }
    } else if (node.hasChildNodes()) {
        for (let i = 0, len = node.childNodes.length; i < len; i++) {
            checkNodeForReplacement(node.childNodes[i]);
        }
    }
}

function setupListener() {
    observer = new MutationObserver((mutations: Array<MutationRecord>) => {
        for (let i = 0, len = mutations.length; i < len; i++) {
            const mutation: MutationRecord = mutations[i];
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node: Node) => {
                    checkNodeForReplacement(node);
                });
            }
        }
    });
    observer.observe(document, {childList: true, subtree: true});
}

function checkElementForTextNodes() {
    if (revert && highlight) {
        const elements = document.body.querySelectorAll('mark[replaced]');
        for (let i = 0, len = elements.length; i < len; i++) {
            checkNodeForReplacement(elements[i].parentElement);
        }
    }
    const iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
    let currentTextNode: Node;
    while ((currentTextNode = iterator.nextNode())) {
        checkNodeForReplacement(currentTextNode);
    }
    !revert && setupListener();
}

function replaceDOMWithNewWords() {
    document.title = replaceText(document.title, true);
    domAction(() => checkElementForTextNodes());
}
