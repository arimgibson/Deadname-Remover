var alivename = null;
var deadname = null;
var loadingInterval = null;
var loaded = false;
var loadingIntervalFrequency = null;
var loadedIntervalFrequency = null;

chrome.extension.sendMessage({}, function(response) {
	if (name === null || deadname === null) {
		loadNames();
	} else {
		changeContent();
	}

	if (!loaded && document.readyState === "complete") {
		loaded = true;
		clearInterval(loadingInterval);
		setInterval(changeContent, loadedIntervalFrequency);
	}
});

function loadNames() {
	chrome.storage.sync.get({
		name: {
			first: '',
			middle: '',
			last: ''
		},
		deadname: {
			first: '',
			middle: '',
			last: ''
		},
		loadingInterval: 50,
		loadedInterval: 1000
	}, function(items) {
		loadingIntervalFrequency = items.loadingInterval;
		loadedIntervalFrequency = items.loadedInterval;

		alivename = items.name;
		deadname = items.deadname;
		changeContent();
		loadingInterval = setInterval(changeContent, loadingIntervalFrequency);
	});
}

function changeContent() {
	if (alivename.first.length !== 0 && deadname.first.length !== 0 &&
		alivename.middle.length !== 0 && deadname.middle.length !== 0 &&
		alivename.last.length !== 0 && deadname.last.length !== 0) {
			fullAlive = alivename.first + ' ' + alivename.middle + ' ' + alivename.last;
			fullDead = deadname.first + ' ' + deadname.middle + ' ' + deadname.last;
			replaceName(fullDead, fullAlive);
	}

	if (alivename.first.length !== 0 && deadname.first.length !== 0) {
		replaceName(deadname.first, alivename.first);
	}

	if (alivename.last.length !== 0 && deadname.last.length !== 0) {
		replaceName(deadname.last, alivename.last);
	}
};

function replaceName(old, replacement) {
	const dead = new RegExp(old, "gi");
	document.title = document.title.replace(dead, replacement);

	var elements = document.body.getElementsByTagName("*");
	for (i = 0; i < elements.length; i++) {
		element = elements[i];
		children = element.childNodes;
		for (n = 0; n < children.length; n++) {
			child = children[n];
			if (child.nodeType === 3) {
				const text = child.nodeValue;
				const newText = text.replace(dead, replacement);
	
				if (newText !== text) {
					element.replaceChild(document.createTextNode(newText), child);
				}
			}
		}
	};
}