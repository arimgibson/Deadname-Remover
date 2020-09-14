import { UserSettings, DEFAULT_SETTINGS } from "./Types";
import { addDOMReadyListener, isDOMReady } from "./dom";

let alivename = null;
let deadname = null;

export function start(settings: UserSettings = DEFAULT_SETTINGS) {
    console.log('Starting.');
    if (!settings.enabled) {
        return;
    }
    if (alivename === null || deadname === null) {
        loadNames(settings);
    } else {
        changeContent();
    }
}

function loadNames(settings: UserSettings) {
    alivename = settings.name;
    deadname = settings.deadname;
    changeContent();
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
