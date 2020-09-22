import {DEFAULT_SETTINGS, UserSettings} from '../types';

let settings: UserSettings = null;
loadSettings().then((setting) => {
    settings = setting;
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.openOptionsPage();
});

interface PortInfo {
    url: string;
    port: chrome.runtime.Port;
}

export const ports: Map<number, Map<number, PortInfo>> = new Map();

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'tab') {
        const reply = () => {
            const message = getSettings();
            if (message instanceof Promise) {
                message.then((asyncMessage) => asyncMessage && port.postMessage(asyncMessage));
            } else if (message) {
                port.postMessage(message);
            }
        };
        const tabId = port.sender.tab.id;
        const {frameId} = port.sender;
        const senderURL = port.sender.url;

        let framesPorts: Map<number, PortInfo>;
        if (ports.has(tabId)) {
            framesPorts = ports.get(tabId);
        } else {
            framesPorts = new Map();
            ports.set(tabId, framesPorts);
        }
        framesPorts.set(frameId, {url: senderURL, port});
        port.onDisconnect.addListener(() => {
            framesPorts.delete(frameId);
            if (framesPorts.size === 0) {
                ports.delete(tabId);
            }
        });

        reply();
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'popup') {
        port.onMessage.addListener(async (message) => await onUIMessage(port, message));
    }
});

function changeSettings(settings: Partial<UserSettings>) {
    saveSettings(settings);
    sendMessage(getTabMessage);
}

function getAllTabs(query: chrome.tabs.QueryInfo) {
    return new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query(query, (tabs) => resolve(tabs));
    });
}

// TODO: Don't forget to add a implementation to get a `site-list` behavior.
const getTabMessage = (url: string, frameURL: string) => {
    return getSettings();
};

async function sendMessage(getMessage: (url: string, frameUrl: string) => any) {
    (await getAllTabs({}))
        .filter((tab) => ports.has(tab.id))
        .forEach((tab) => {
            const framesPorts = ports.get(tab.id);
            framesPorts.forEach(({url, port}, frameId: number) => {
                const message = getMessage(tab.url, frameId === 0 ? null : url);
                if (tab.active && frameId === 0) {
                    port.postMessage(message);
                } else {
                    setTimeout(() => port.postMessage(message));
                }
            });
        });
}

function loadSettings() {
    return new Promise<UserSettings>((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (settings: UserSettings) => {
            resolve(settings);
            return;
        });
    });
}

function saveSettings($settings: Partial<UserSettings>) {
    settings = {...settings, ...$settings};
    return new Promise<void>((resolve, reject) => {
        chrome.storage.sync.set($settings, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve();
        });
    });
}

function getSettings() {
    return settings;
}

async function onUIMessage(port: chrome.runtime.Port, {type, data, id}) {
    switch (type) {
        case 'get-data': {
            const data = getSettings();
            port.postMessage({id, data});
            break;
        }
        case 'save-data': {
            changeSettings(data);
            break;
        }
    }
}
