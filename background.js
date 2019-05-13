// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      //chrome.pageAction.show(sender.tab.id);
      console.log('background.js');
      console.log('request')
      console.log(request)
      console.log('sender')
      console.log(sender)
      
      console.log('sendResponse')
      console.log(sendResponse)
      sendResponse();
});

chrome.runtime.onInstalled.addListener(function (object) {
    chrome.runtime.openOptionsPage(/*callback*/)
});

  // Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.runtime.openOptionsPage(/*callback*/)
    //openOrFocusOptionsPage();
});