import { UserSettings, DEFAULT_SETTINGS } from "./Types";
import { addDOMReadyListener, isDOMReady } from "./dom";

let alivename = null;
let deadname = null;

function start() {
    // Some wacky hack to get a click-able link to the inject.js source code in Firefox that don't load side-loaded add-ons in Files.
    console.log('Starting.');
    let disabled = false;
    chrome.storage.sync.get(DEFAULT_SETTINGS, (sync: UserSettings) => {
        if (sync.enabled == false) {
            disabled = true;
        }
        if (disabled) {
            return;
        }
        if (name === null || deadname === null) {
            loadNames();
        } else {
            changeContent();
        }

    });
}

function loadNames() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(sync: UserSettings) {
        alivename = sync.name;
        deadname = sync.deadname;
        changeContent();
        return;
    });
}

function changeContent() {
  const alivenames = [];
  const deadnames = [];
    if (alivename.first.length !== 0 && deadname.first.length !== 0 &&
        alivename.middle.length !== 0 && deadname.middle.length !== 0 &&
        alivename.last.length !== 0 && deadname.last.length !== 0) {
            const fullAlive = alivename.first + ' ' + alivename.middle + ' ' + alivename.last;
            const fullDead = deadname.first + ' ' + deadname.middle + ' ' + deadname.last;
      alivenames.push(fullAlive);
      deadnames.push(fullDead);
    }
    if (alivename.first.length !== 0 && deadname.first.length !== 0) {
    alivenames.push(alivename.first);
    deadnames.push(deadname.first);
    }

    if (alivename.last.length !== 0 && deadname.last.length !== 0) {
    alivenames.push(alivename.last);
    deadnames.push(deadname.last);
    }

  replaceNames(deadnames, alivenames);
};

function checkNodeForReplacement(node: Node, dead: RegExp[], replacement: string[]) {
    if (node.nodeType === 3) {
        for (let i = 0, len = dead.length; i < len; i++) {
            const text = node.nodeValue;
            const newText = text.replace(dead[i], replacement[i]);
            if (newText !== text) {
                node.parentElement.replaceChild(document.createTextNode(newText), node);
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
    const observer = new MutationObserver((mutations: Array<MutationRecord>) => {
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
	var elements = document.body.getElementsByTagName("*");
	for (let i = 0, len = elements.length; i < len; i++) {
		let element = elements[i];
		let children = element.childNodes;
		for (let n = 0, len2 = children.length; n < len2; n++) {
			checkNodeForReplacement(children[n], dead, replacement);
		}
	};
    setupListener(dead, replacement);
}

function replaceNames(old: string[], replacement: string[]) {
    const dead = [];
    for (let i = 0, len = old.length; i < len; i++) {
        dead.push(new RegExp("\\b" + old[i] + "\\b", "gi"));
    }
    if (!isDOMReady()) {
        addDOMReadyListener(() => {
            for (let i = 0, len = dead.length; i < len; i++) {
                document.title = document.title.replace(dead[i], replacement[i]);
            }
            checkElementForTextNodes(dead, replacement);
        })
    } else {
        for (let i = 0, len = dead.length; i < len; i++) {
            document.title = document.title.replace(dead[i], replacement[i]);
        }
        checkElementForTextNodes(dead, replacement);
    }
}

start();
