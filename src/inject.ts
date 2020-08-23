import { UserSettings, DEFAULT_SETTINGS } from "./Types";

let alivename = null;
let deadname = null;
let loaded = false;

function start() {
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

		if (!loaded && document.readyState === "complete") {
			loaded = true;
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
	if (alivename.first.length !== 0 && deadname.first.length !== 0 &&
		alivename.middle.length !== 0 && deadname.middle.length !== 0 &&
		alivename.last.length !== 0 && deadname.last.length !== 0) {
			const fullAlive = alivename.first + ' ' + alivename.middle + ' ' + alivename.last;
			const fullDead = deadname.first + ' ' + deadname.middle + ' ' + deadname.last;
			replaceName(fullDead, fullAlive, true);
	}
	if (alivename.first.length !== 0 && deadname.first.length !== 0) {
		replaceName(deadname.first, alivename.first, true);
	}

	if (alivename.last.length !== 0 && deadname.last.length !== 0) {
		replaceName(deadname.last, alivename.last, true);
	}
};

function checkNodeForReplacement(node: Node, dead: RegExp, replacement: string) {
	if (node.nodeType === 3) {
		const text = node.nodeValue;
		const newText = text.replace(dead, replacement);

		if (newText !== text) {
			node.parentElement.replaceChild(document.createTextNode(newText), node);
		}
	}
}

function setupListener(dead: RegExp, replacement: string) {
	const observer = new MutationObserver((mutations: Array<MutationRecord>) => {
		for (let i = 0, len = mutations.length; i < len; i++) {
			const mutation: MutationRecord = mutations[i];
			mutation.addedNodes.forEach((node: Node) =>{
				checkNodeForReplacement(node, dead, replacement);
			});
		}
	});
	observer.observe(document, {childList: true, subtree: true});
}


function replaceName(old: string, replacement: string, shouldListen: boolean) {
	const dead = new RegExp("\\b" + old + "\\b", "gi");
	document.title = document.title.replace(dead, replacement);

	var elements = document.body.getElementsByTagName("*");
	for (let i = 0, len = elements.length; i < len; i++) {
		let element = elements[i];
		let children = element.childNodes;
		for (let n = 0, len2 = children.length; n < len2; n++) {
			checkNodeForReplacement(children[n], dead, replacement);
		}
	};
	shouldListen && setupListener(dead, replacement);
}

start();