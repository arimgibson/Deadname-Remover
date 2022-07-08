import {Name, UserSettings, DEFAULT_SETTINGS} from '../types';

const port = chrome.runtime.connect({name: 'popup'});
let deadNameCounter = 0;
let counter = 0;
let settings: UserSettings = null;

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

export function isSettingsReady() {
    return settings != null;
}

const readyStateListeners = new Set<() => void>();

export function addSettingsListener(listener: () => void) {
    readyStateListeners.add(listener);
}

getData().then(($settings: UserSettings) => {
    settings = $settings;
    readyStateListeners.forEach((listener) => listener());
    readyStateListeners.clear();
});

function saveCurrentDeadName(index: number) {
    const deadName: Name = {
        first: (document.getElementById('txtFirstDeadname') as HTMLInputElement).value.trim(),
        middle: (document.getElementById('txtMidDeadname') as HTMLInputElement).value.trim(),
        last: (document.getElementById('txtLastDeadname') as HTMLInputElement).value.trim()
    };
    if (deadName.first || deadName.middle || deadName.last) {
        settings.deadname[index] = deadName;
    } else {
        settings.deadname.splice(index, 1);
    }
}

function loadDOM() {
    (document.getElementById('txtFirstName') as HTMLInputElement).value = settings.name.first;
    (document.getElementById('txtMidName') as HTMLInputElement).value = settings.name.middle;
    (document.getElementById('txtLastName') as HTMLInputElement).value = settings.name.last;

    (document.getElementById('txtFirstDeadname') as HTMLInputElement).value = settings.deadname[deadNameCounter].first;
    (document.getElementById('txtMidDeadname') as HTMLInputElement).value = settings.deadname[deadNameCounter].middle;
    (document.getElementById('txtLastDeadname') as HTMLInputElement).value = settings.deadname[deadNameCounter].last;

    (document.getElementById('stealth-option') as HTMLInputElement).checked = settings.stealthMode;
    (document.getElementById('highlight-option') as HTMLInputElement).checked = settings.highlight;

    renderDeadName(0, 0);
}

function changeSettings($settings: Partial<UserSettings>) {
    port.postMessage({type: 'save-data', data: $settings});
}

document.addEventListener('DOMContentLoaded', () => {
    if (!isSettingsReady()) {
        addSettingsListener(() => loadDOM());
    } else {
        loadDOM();
    }
});

const saveSettings = () => {
    const name: Name = {
        first: (document.getElementById('txtFirstName') as HTMLInputElement).value.trim(),
        middle: (document.getElementById('txtMidName') as HTMLInputElement).value.trim(),
        last: (document.getElementById('txtLastName') as HTMLInputElement).value.trim()
    };

    saveCurrentDeadName(deadNameCounter);

    const $settings: Partial<UserSettings> = {
        name: name,
        deadname: settings.deadname,
        stealthMode: settings.stealthMode,
        highlight: settings.highlight,
    };

    changeSettings($settings);

    document.getElementById('deadnames').classList.add('hide');
};
document.getElementById('btnSave').addEventListener('click', saveSettings);

const coll = document.getElementsByClassName('hide');

for (let i = 0, len = coll.length; i < len; i++) {
    coll[i].addEventListener('click', (event: MouseEvent) => {
        const content = (event.target as HTMLInputElement).nextElementSibling as HTMLElement;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = 'max-content';
        }
    });
}

const leftArrow = document.querySelector('.leftArrow');
const rightArrow = document.querySelector('.rightArrow');
leftArrow.addEventListener('click', () => {
    renderDeadName(deadNameCounter, --deadNameCounter);
});

rightArrow.addEventListener('click', () => {
    renderDeadName(deadNameCounter, ++deadNameCounter);
});

(document.getElementById('stealth-option') as HTMLInputElement).addEventListener('change', (e: Event) => {
    settings.stealthMode = (e.target as HTMLInputElement).checked;
});

(document.getElementById('highlight-option') as HTMLInputElement).addEventListener('change', (e: Event) => {
    settings.highlight = (e.target as HTMLInputElement).checked;
});

function onChangeInput() {
    function changeInput() {
        const deadName: Name = {
            first: (document.getElementById('txtFirstDeadname') as HTMLInputElement).value.trim(),
            middle: (document.getElementById('txtMidDeadname') as HTMLInputElement).value.trim(),
            last: (document.getElementById('txtLastDeadname') as HTMLInputElement).value.trim()
        };
        if (deadName.first || deadName.middle || deadName.last) {
            rightArrow.classList.toggle('active', true);
        } else {
            saveCurrentDeadName(deadNameCounter);
            renderDeadName(deadNameCounter, deadNameCounter, {disableSave: true});
        }
    }
    (document.getElementById('txtFirstDeadname') as HTMLInputElement).addEventListener('change', changeInput);
    (document.getElementById('txtMidDeadname') as HTMLInputElement).addEventListener('change', changeInput);
    (document.getElementById('txtLastDeadname') as HTMLInputElement).addEventListener('change', changeInput);
}

onChangeInput();

function renderDeadName(oldIndex: number, newIndex: number, options: {disableSave: boolean} = {disableSave: false}) {
    if (!options.disableSave) {
        saveCurrentDeadName(oldIndex);
    }
    if (newIndex === 0) {
        leftArrow.classList.toggle('active', false);
    } else {
        leftArrow.classList.toggle('active', true);
    }
    if (newIndex === settings.deadname.length) {
        settings.deadname.push(DEFAULT_SETTINGS.deadname[0]);
        rightArrow.classList.toggle('active', false);
    } else {
        rightArrow.classList.toggle('active', true);
    }
    (document.getElementById('txtFirstDeadname') as HTMLInputElement).value = settings.deadname[newIndex].first;
    (document.getElementById('txtMidDeadname') as HTMLInputElement).value = settings.deadname[newIndex].middle;
    (document.getElementById('txtLastDeadname') as HTMLInputElement).value = settings.deadname[newIndex].last;
}
