import {Name, UserSettings} from '../types';

const port = chrome.runtime.connect({name: 'popup'});
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

function changeTheme(theme: UserSettings['theme']) {
    settings.theme = theme;
    const toggleDeadNameButton = (document.querySelector('#show-hide-deadnames') as HTMLButtonElement);
    const saveButton = (document.querySelector('#save') as HTMLButtonElement);
    const isHighContrast = theme.startsWith('high-contrast');

    document.body.className = theme;
    toggleDeadNameButton.dataset.text = isHighContrast ? '' : 'Show/Hide Deadnames';
    toggleDeadNameButton.innerHTML = isHighContrast ? 'Show/Hide Deadnames' : '';
    saveButton.dataset.text = isHighContrast ? '' : 'Save Chosen and Deadname Settings';
    saveButton.innerHTML = isHighContrast ? 'Save Chosen and Deadname Settings' : '';
}

function loadDOM() {
    // Loading settings into the DOM.
    (document.querySelector('#chosen-first-name') as HTMLInputElement).value = settings.name.first;
    (document.querySelector('#chosen-middle-name') as HTMLInputElement).value = settings.name.middle;
    (document.querySelector('#chosen-last-name') as HTMLInputElement).value = settings.name.last;

    for (let x = 0; x < settings.deadname.length; x++) {
        (document.getElementById('dead-first-name') as HTMLInputElement).value += settings.deadname[x].first + ', ';
        (document.getElementById('dead-middle-name') as HTMLInputElement).value += settings.deadname[x].middle + ', ';
        (document.getElementById('dead-last-name') as HTMLInputElement).value += settings.deadname[x].last + ', ';
    }

    (document.querySelector('#stealth-toggle') as HTMLInputElement).checked = settings.stealthMode;
    (document.querySelector('#highlight-toggle') as HTMLInputElement).checked = settings.highlight;
    (document.querySelector('#theme-toggle') as HTMLSelectElement).value = settings.theme;

    // Registering events
    (document.querySelector('#save') as HTMLButtonElement).addEventListener('click', saveSettings);
    (document.querySelector('#show-hide-deadnames') as HTMLButtonElement).addEventListener('click', () => {
        const formElement: HTMLFormElement = document.querySelector('#deadname-form');
        formElement.hidden = !formElement.hidden;
    });
    (document.querySelector('#theme-toggle') as HTMLSelectElement).addEventListener('change', (evt) => {
        changeTheme(((evt.target as HTMLSelectElement).value as any));
    });
    (document.querySelector('#stealth-toggle') as HTMLInputElement).addEventListener('click', (evt) => {
        if (!evt.target) {
            return;
        }
        settings.stealthMode = (evt.target as HTMLInputElement).checked;
    });
    (document.querySelector('#highlight-toggle') as HTMLInputElement).addEventListener('click', (evt) => {
        if (!evt.target) {
            return;
        }
        settings.highlight = (evt.target as HTMLInputElement).checked;
    });
    changeTheme(settings.theme);
    changeIcon(settings.theme);
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
        first: (document.getElementById('chosen-first-name') as HTMLInputElement).value.trim(),
        middle: (document.getElementById('chosen-middle-name') as HTMLInputElement).value.trim(),
        last: (document.getElementById('chosen-last-name') as HTMLInputElement).value.trim()
    };

    const deadname: Name[] = [];

    const firstDeadNames = (document.getElementById('dead-first-name') as HTMLInputElement).value.split(',');
    const middleDeadNames = (document.getElementById('dead-middle-name') as HTMLInputElement).value.split(',');
    const lastDeadNames = (document.getElementById('dead-last-name') as HTMLInputElement).value.split(',');
    const occurences = Math.max(...[firstDeadNames.length - 1, middleDeadNames.length - 1, lastDeadNames.length - 1], 0);

    for (let x = 0; x < occurences; x++) {
        deadname[x] = {
            first: firstDeadNames[x].trim(),
            middle: middleDeadNames[x].trim(),
            last : lastDeadNames[x].trim(),
        };
    }

    const {stealthMode, highlight, theme} = settings;
    const $settings: Partial<UserSettings> = {
        name,
        deadname,
        stealthMode,
        highlight,
        theme
    };
    changeSettings($settings);

    const savedFlash: HTMLHeadingElement = document.querySelector('#saved');
    savedFlash.hidden = false;
    savedFlash.classList.add('flash-alert');
    setTimeout(() => {
        savedFlash.hidden = true;
        savedFlash.classList.remove('flash-alert');
    }, 5000);
};

function changeIcon(theme: UserSettings['theme']) {
    const iconElement: HTMLLinkElement = document.querySelector("link[rel='icon']");
    if (theme === 'non-binary') {
        iconElement.href = '../icons/nb19.png';
    } else if (theme === 'trans') {
        iconElement.href = '../icons/trans19.png';
    } else {
        iconElement.href = '../icons/stealth.svg';
    }
}
