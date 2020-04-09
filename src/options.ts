import { Name } from './Types';

document.getElementById('btnToggleDeadnames').addEventListener('click', function() {
    const section: HTMLElement = document.getElementById('deadnames');
    section.classList.toggle('hide');
});

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get({
        name: {
            first: '',
            middle: '',
            last: ''
        },
        deadname: {
            first: '',
            middle: '',
            last: ''
        },
		loadingInterval: 50,
		loadedInterval: 1000
    }, function(items) {

        (<HTMLInputElement>document.getElementById('txtFirstName')).value = items.name.first;
        (<HTMLInputElement>document.getElementById('txtMidName')).value = items.name.middle;
        (<HTMLInputElement>document.getElementById('txtLastName')).value = items.name.last;

        (<HTMLInputElement>document.getElementById('txtFirstDeadname')).value = items.deadname.first;
        (<HTMLInputElement>document.getElementById('txtMidDeadname')).value = items.deadname.middle;
        (<HTMLInputElement>document.getElementById('txtLastDeadname')).value = items.deadname.last;

        (<HTMLInputElement>document.getElementById('txtUpdateLoading')).value = items.loadingInterval;
        (<HTMLInputElement>document.getElementById('txtUpdateLoaded')).value = items.loadedInterval;
    });
});


document.getElementById('btnSave').addEventListener('click', function() {
    var name:Name = {
        first: (<HTMLInputElement>document.getElementById('txtFirstName')).value.trim(),
        middle: (<HTMLInputElement>document.getElementById('txtMidName')).value.trim(),
        last: (<HTMLInputElement>document.getElementById('txtLastName')).value.trim()
    }

    var deadname = {
        first: (<HTMLInputElement>document.getElementById('txtFirstDeadname')).value.trim(),
        middle: (<HTMLInputElement>document.getElementById('txtMidDeadname')).value.trim(),
        last: (<HTMLInputElement>document.getElementById('txtLastDeadname')).value.trim()
    }

    let loadingInterval = parseInt((<HTMLInputElement>document.getElementById('txtUpdateLoading')).value);
    let loadedInterval = parseInt((<HTMLInputElement>document.getElementById('txtUpdateLoaded')).value);
    
    if (isNaN(loadingInterval) || isNaN(loadedInterval)) {
        alert('Frequencies must be numbers in milliseconds');
        return;
    }

    chrome.storage.sync.set({
        name: name,
        deadname: deadname,
		loadingInterval: loadingInterval,
		loadedInterval: loadedInterval
    }, function() {
        alert('Saved. You may need to refresh already open pages.');
        document.getElementById('deadnames').classList.add('hide');
    });
});
