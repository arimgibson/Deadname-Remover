import {UserSettings, DEFAULT_SETTINGS} from './types';

const loadSettings = () => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (sync: UserSettings) => {
        (document.querySelector('.OnOff') as HTMLInputElement).checked = sync.enabled;
        return;
    });
};

document.addEventListener('DOMContentLoaded', loadSettings);

const saveSettings = () => {
    const OnOff = (document.querySelector('.OnOff') as HTMLInputElement).checked;

    const settings: Partial<UserSettings> = {
        enabled: OnOff
    };

    chrome.storage.sync.set(settings);

    alert('Saved. You may need to refresh already open pages.');
};
document.getElementById('btnOpenNameSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

const toggle = document.querySelector('.OnOff') as HTMLInputElement;
toggle.addEventListener('click', saveSettings);
