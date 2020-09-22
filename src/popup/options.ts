import {Name, UserSettings} from '../types';

const port = chrome.runtime.connect({name: 'popup'});
let counter = 0;

function getRequestId() {
    return ++counter;
}

function sendRequest(request, executor: (response, resolve: (data?) => void, reject: (error: Error) => void) => void) {
    const id = getRequestId();
    return new Promise((resolve, reject) => {
        const listener = ({id: responseId, ...response}) => {
            if (responseId === id) {
                executor(response, resolve, reject);
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

function loadSettings() {
    getData().then((settings: UserSettings) => {
        (document.getElementById('txtFirstName') as HTMLInputElement).value = settings.name.first;
        (document.getElementById('txtMidName') as HTMLInputElement).value = settings.name.middle;
        (document.getElementById('txtLastName') as HTMLInputElement).value = settings.name.last;

        (document.getElementById('txtFirstDeadname') as HTMLInputElement).value = settings.deadname.first;
        (document.getElementById('txtMidDeadname') as HTMLInputElement).value = settings.deadname.middle;
        (document.getElementById('txtLastDeadname') as HTMLInputElement).value = settings.deadname.last;
    });
}

function changeSettings(settings: Partial<UserSettings>) {
    port.postMessage({type: 'save-data', data: settings});
}

document.addEventListener('DOMContentLoaded', loadSettings);

const saveSettings = () => {
    const name: Name = {
        first: (document.getElementById('txtFirstName') as HTMLInputElement).value.trim(),
        middle: (document.getElementById('txtMidName') as HTMLInputElement).value.trim(),
        last: (document.getElementById('txtLastName') as HTMLInputElement).value.trim()
    };

    const deadname: Name = {
        first: (document.getElementById('txtFirstDeadname') as HTMLInputElement).value.trim(),
        middle: (document.getElementById('txtMidDeadname') as HTMLInputElement).value.trim(),
        last: (document.getElementById('txtLastDeadname') as HTMLInputElement).value.trim()
    };

    const settings: Partial<UserSettings> = {
        name: name,
        deadname: deadname
    };

    changeSettings(settings);

    document.getElementById('deadnames').classList.add('hide');
};
document.getElementById('btnSave').addEventListener('click', saveSettings);

const coll = document.getElementsByClassName('hide');

for (let i = 0, len = coll.length; i < len; i++) {
    coll[i].addEventListener('click', (event: MouseEvent) => {
        (event.target as HTMLInputElement).classList.toggle('active');
        const content = (event.target as HTMLInputElement).nextElementSibling as HTMLElement;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = (content.scrollHeight + 20) + 'px';
        }
    });
}
