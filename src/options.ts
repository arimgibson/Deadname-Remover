import { Name, UserSettings, DEFAULT_SETTINGS } from './Types';

let loadSettings = () => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (sync: UserSettings) => {
        (document.getElementById('txtFirstName') as HTMLInputElement).value = sync.name.first;
        (document.getElementById('txtMidName') as HTMLInputElement).value = sync.name.middle;
        (document.getElementById('txtLastName') as HTMLInputElement).value = sync.name.last;

        (document.getElementById('txtFirstDeadname') as HTMLInputElement).value = sync.deadname.first;
        (document.getElementById('txtMidDeadname') as HTMLInputElement).value = sync.deadname.middle;
        (document.getElementById('txtLastDeadname') as HTMLInputElement).value = sync.deadname.last;
        (document.querySelector('.OnOff') as HTMLInputElement).checked = sync.enabled;
        return;
    });
};

document.addEventListener('DOMContentLoaded', loadSettings);



let saveSettings = () => {
    const name: Name = {
        first: (document.getElementById('txtFirstName') as HTMLInputElement).value.trim(),
        middle: (document.getElementById('txtMidName') as HTMLInputElement).value.trim(),
        last: (document.getElementById('txtLastName') as HTMLInputElement).value.trim()
    }

    const deadname: Name = {
        first: (document.getElementById('txtFirstDeadname') as HTMLInputElement).value.trim(),
        middle: (document.getElementById('txtMidDeadname') as HTMLInputElement).value.trim(),
        last: (document.getElementById('txtLastDeadname') as HTMLInputElement).value.trim()
    }

    const OnOff = (document.querySelector('.OnOff') as HTMLInputElement).checked;

    const settings: UserSettings = {
        name: name,
        deadname: deadname,
        enabled: OnOff,
    };

    chrome.storage.sync.set(settings);
    
    alert('Saved. You may need to refresh already open pages.');
    document.getElementById('deadnames').classList.add('hide');
}
document.getElementById('btnSave').addEventListener('click', saveSettings);

var coll = document.getElementsByClassName("hide");

for (let i = 0, len = coll.length; i < len; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = (content.scrollHeight + 20) + "px";
    } 
  });
}

const toggle = document.querySelector('.OnOff') as HTMLInputElement;
toggle.addEventListener('click', () => {
    if (toggle.checked) {
        chrome.storage.sync.set({enabled: false});
    } else {
        chrome.storage.sync.set({enabled: true});
    }
})