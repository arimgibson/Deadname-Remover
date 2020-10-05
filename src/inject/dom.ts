export function isDOMReady() {
    return document.readyState === 'complete' || document.readyState === 'interactive';
}

const readyStateListeners = new Set<() => void>();

export function addDOMReadyListener(listener: () => void) {
    readyStateListeners.add(listener);
}

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
