import {Name, UserSettings, DEFAULT_SETTINGS} from './types';

const loadSettings = () => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (sync: UserSettings) => {
        (document.getElementById('txtFirstName') as HTMLInputElement).value = sync.name.first;
        (document.getElementById('txtMidName') as HTMLInputElement).value = sync.name.middle;
        (document.getElementById('txtLastName') as HTMLInputElement).value = sync.name.last;

        (document.getElementById('txtFirstDeadname') as HTMLInputElement).value = sync.deadname.first;
        (document.getElementById('txtMidDeadname') as HTMLInputElement).value = sync.deadname.middle;
        (document.getElementById('txtLastDeadname') as HTMLInputElement).value = sync.deadname.last;
        return;
    });
};

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

    chrome.storage.sync.set(settings);

    alert('Saved. You may need to refresh already open pages.');
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
