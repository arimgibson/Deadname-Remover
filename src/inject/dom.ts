function isDOMReady() {
    return document.readyState === 'complete' || document.readyState === 'interactive';
}

const readyStateListeners = new Set<() => void>();

function addDOMReadyListener(listener: () => void) {
    readyStateListeners.add(listener);
}

export const domAction = (callback: () => void) => {
    if (!isDOMReady()) {
        addDOMReadyListener(callback);
    } else {
        callback();
    }
};

if (!isDOMReady()) {
    const onReadyStateChange = () => {
        if (isDOMReady()) {
            document.removeEventListener('readystatechange', onReadyStateChange);
            readyStateListeners.forEach((listener) => listener());
            readyStateListeners.clear();
        }
    };
    document.addEventListener('readystatechange', onReadyStateChange);
}
