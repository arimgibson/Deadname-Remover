# Dead-Name-Remover
An easy to use browser plugin to automatically replace dead names with prefered names.

[![Chrome](readme_files/chrome.png "Chrome")](https://chrome.google.com/webstore/detail/deadname-remover/cceilgmnkeijahkehfcgfalepihfbcag/)
[![Firefox](readme_files/firefox.png "Firefox")](https://addons.mozilla.org/en-US/firefox/addon/deadname-remover/)

# Build Instructions

Requirements:

 - Node v8.10.0

Open a command shell and Navigate to the root directory, type `npm install` to install the node devDependencies.
To compile the project type `npm run build`, this compiles the Typescript files into Javascript.

Webpack collate a formatted use-able plugin structure into the dist/ folder.
From this folder it can be side-loaded into Firefox or Chromium-based browsers.
