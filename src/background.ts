import { DEFAULT_SETTINGS, UserSettings } from "./Types";

chrome.runtime.onInstalled.addListener( () => {
    chrome.runtime.openOptionsPage();
});

function getSettings() {
    return new Promise<UserSettings>((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (settings: UserSettings) => {
            resolve(settings);
            return;
        })
    });
}
interface PortInfo {
    url: string;
    port: chrome.runtime.Port;
}

const ports: Map<number, Map<number, PortInfo>> = new Map();

chrome.runtime.onConnect.addListener(async (port) => {
    if (port.name === 'tab') {
        const tabId = port.sender.tab.id;
        const frameId = port.sender.frameId;
        const url = port.sender.url;
        let framesPorts: Map<number, PortInfo>;
        if (ports.has(tabId)) {
            framesPorts = ports.get(tabId);
        } else {
            framesPorts = new Map();
            ports.set(tabId, framesPorts);
        }
        framesPorts.set(frameId, {url, port});
        port.onDisconnect.addListener(() => {
            framesPorts.delete(frameId);
            if (framesPorts.size === 0) {
                ports.delete(tabId);
            }
        });

        const message = getSettings();
        if (message instanceof Promise) {
            message.then((asyncMessage) => asyncMessage && port.postMessage(asyncMessage));
        } else {
            port.postMessage(message);
        }
    }
});