chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('background.js');
        console.log('request')
        console.log(request)
        console.log('sender')
        console.log(sender)
      
        console.log('sendResponse')
        console.log(sendResponse)
        sendResponse();
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.runtime.openOptionsPage();
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.runtime.openOptionsPage();
});
