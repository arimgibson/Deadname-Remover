# Dead-Name-Remover
An easy to use browser plugin to automatically replace dead names with prefered names.

Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/deadname-remover/cceilgmnkeijahkehfcgfalepihfbcag/) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/deadname-remover/) for more info.

If you somehow can't(due to disabling lgbt related extension) install the extension, but can install greasemonkey/tampermonkey, you could install it by clicking [here](https://github.com/WillHayCode/Deadname-Remover/raw/master/deadname-remover.user.js)

# Build Instructions

Requirements:

 - Node vLTS or higher.

Open a command shell and Navigate to the root directory, type `npm install` to install the node devDependencies.
To compile the project type `npm run build`, this compiles the Typescript files into Javascript.

The building process will collate a formatted use-able plugin structure into the dist/ folder.
From this folder it can be side-loaded into Firefox or Chromium-based browsers.
