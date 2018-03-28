
document.getElementById('btnToggleDeadnames').addEventListener('click', function() {
    section = document.getElementById('deadnames');
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
        document.getElementById('txtFirstName').value = items.name.first;
        document.getElementById('txtMidName').value = items.name.middle;
        document.getElementById('txtLastName').value = items.name.last;

        document.getElementById('txtFirstDeadname').value = items.deadname.first;
        document.getElementById('txtMidDeadname').value = items.deadname.middle;
        document.getElementById('txtLastDeadname').value = items.deadname.last;


        document.getElementById('txtUpdateLoading').value = items.loadingInterval;
        document.getElementById('txtUpdateLoaded').value = items.loadedInterval;
    });
});

document.getElementById('btnSave').addEventListener('click', function() {
    var name = {
        first: document.getElementById('txtFirstName').value.trim(),
        middle: document.getElementById('txtMidName').value.trim(),
        last: document.getElementById('txtLastName').value.trim()
    }

    var deadname = {
        first: document.getElementById('txtFirstDeadname').value.trim(),
        middle: document.getElementById('txtMidDeadname').value.trim(),
        last: document.getElementById('txtLastDeadname').value.trim()
    }

    loadingInterval = parseInt(document.getElementById('txtUpdateLoading').value);
    loadedInterval = parseInt(document.getElementById('txtUpdateLoaded').value);
    
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
