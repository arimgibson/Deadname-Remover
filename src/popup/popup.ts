import {UserSettings} from '../types';

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

function changeSettings() {
    const settings: Partial<UserSettings> = {
        enabled: (document.querySelector('.OnOff') as HTMLInputElement).checked
    };
    port.postMessage({type: 'save-data', data: settings});
}

function loadSettings() {
    getData().then((settings: UserSettings) => {
        (document.querySelector('.OnOff') as HTMLInputElement).checked = settings.enabled;
    });
}

document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('btnOpenNameSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

const toggle = document.querySelector('.OnOff') as HTMLInputElement;
toggle.addEventListener('click', changeSettings);
