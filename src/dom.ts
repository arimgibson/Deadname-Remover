export function throttle<T extends(...args: any[]) => any>(callback: T) {
    let pending = false;
    let frameId: number = null;
    let lastArgs: any[];

    const throttled: T = ((...args: any[]) => {
        lastArgs = args;
        if (frameId) {
            pending = true;
        } else {
            callback(...lastArgs);
            frameId = requestAnimationFrame(() => {
                frameId = null;
                if (pending) {
                    callback(...lastArgs);
                    pending = false;
                }
            });
        }
    }) as any;

    const cancel = () => {
        cancelAnimationFrame(frameId);
        pending = false;
        frameId = null;
    };

    return Object.assign(throttled, {cancel});
}

export function isDOMReady() {
    return document.readyState === 'complete' || document.readyState === 'interactive';
}

const readyStateListeners = new Set<() => void>();

export function addDOMReadyListener(listener: () => void) {
    readyStateListeners.add(listener);
}

export function removeDOMReadyListener(listener: () => void) {
    readyStateListeners.delete(listener);
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