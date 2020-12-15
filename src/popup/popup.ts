import {UserSettings} from '../types';
import {domAction} from '../inject/dom';

const port = chrome.runtime.connect({name: 'popup'});
let counter = 0;

function getRequestId() {
    return ++counter;
}

function sendRequest(request, executor: (response, resolve: (data?) => void) => void) {
    const id = getRequestId();
    return new Promise((resolve) => {
        const listener = ({id: responseId, ...response}) => {
            if (responseId === id) {
                executor(response, resolve);
                port.onMessage.removeListener(listener);
            }
        };
        port.onMessage.addListener(listener);
        port.postMessage({...request, id});
    });
}

function getData() {
    return sendRequest({type: 'get-data'}, ({data}, resolve) => resolve(data));
}

const changeSettings = () => {
    const settings: Partial<UserSettings> = {
        enabled: (document.querySelector('#extension-toggle') as HTMLInputElement).checked,
        stealthMode: (document.querySelector('#stealth-toggle') as HTMLInputElement).checked,
        highlight: (document.querySelector('#highlight-indicator-toggle') as HTMLInputElement).checked,
        theme: (document.querySelector('#theme-toggle') as HTMLSelectElement).value as UserSettings['theme'],
    };
    port.postMessage({type: 'save-data', data: settings});
};

function loadSettings() {
    getData().then((settings: UserSettings) => {
        changeTheme(settings.theme);
        (document.querySelector('#extension-toggle') as HTMLInputElement).checked = settings.enabled;
        (document.querySelector('#stealth-toggle') as HTMLInputElement).checked = settings.stealthMode;
        (document.querySelector('#highlight-indicator-toggle') as HTMLInputElement).checked = settings.highlight;
        (document.querySelector('#theme-toggle') as HTMLSelectElement).value = settings.theme;
    });
}

document.addEventListener('DOMContentLoaded', loadSettings);

function changeTheme(theme: UserSettings['theme']) {
    const viewOptions = (document.querySelector('#view-options') as HTMLInputElement);
    const isHighContrast = theme.startsWith('high-contrast');

    document.body.className = theme;
    viewOptions.dataset.text = isHighContrast ? '' : 'View All Options';
    viewOptions.innerHTML = isHighContrast ? 'View All Options' : '';
}

const registerEvents = () => {
    (document.querySelector('#theme-toggle') as HTMLSelectElement).onchange = (evt) => {
        changeTheme(((evt.target as HTMLSelectElement).value as any));
    };

    (document.querySelector('#extension-toggle') as HTMLInputElement).onchange = changeSettings;
    (document.querySelector('#stealth-toggle') as HTMLInputElement).onchange = changeSettings;
    (document.querySelector('#highlight-indicator-toggle') as HTMLInputElement).onchange = changeSettings;
    (document.querySelector('#view-options') as HTMLButtonElement).onclick = async () => {
        chrome.tabs.create({
            url: '/popup/options.html',
        });
        window.close();
    };
};

domAction(registerEvents);
