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

function changeSettings() {
    const settings: Partial<UserSettings> = {
        enabled: (document.querySelector('.onoff-option') as HTMLInputElement).checked
    };
    port.postMessage({type: 'save-data', data: settings});
}

function loadSettings() {
    getData().then((settings: UserSettings) => {
        (document.querySelector('.onoff-option') as HTMLInputElement).checked = settings.enabled;
    });
}

document.addEventListener('DOMContentLoaded', loadSettings);

const registerEvents = () => {
    document.getElementById('btnOpenNameSettings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    (document.querySelector('.onoff-option')).addEventListener('click', changeSettings);
};

domAction(registerEvents);
