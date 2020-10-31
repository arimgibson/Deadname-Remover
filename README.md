# Dead-Name-Remover
An easy to use browser plugin to automatically replace dead names with preferred names

Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/deadname-remover/cceilgmnkeijahkehfcgfalepihfbcag/) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/deadname-remover/) for more info

If you somehow can't install the extension (due to disabling LGBT-related extension), but can install Greasemonkey/Tampermonkey: you can install it by clicking [here](https://github.com/WillHayCode/Deadname-Remover/raw/master/deadname-remover.user.js)

# Build Instructions

Requires Node LTS or higher

 - Open a command shell and navigate to the root directory
 - Type `npm install` to install the node devDependencies
 - To compile the project type `npm run debug` for debug, and `npm run production` for production-ready files
 - The building process will collate a formatted use-able plugin structure into the dist/-folder
 - From this folder it can be side-loaded into Firefox or Chromium-based browsers
