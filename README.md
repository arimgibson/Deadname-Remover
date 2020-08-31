# Dead-Name-Remover
An easy to use browser plugin to automatically replace dead names with prefered names.
Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/deadname-remover/cceilgmnkeijahkehfcgfalepihfbcag/) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/deadname-remover/) for more info.

# Build Instructions

Requirements:

 - Node v8.10.0

Open a command shell and Navigate to the root directory, type `npm install` to install the node devDependencies.
To compile the project type `npm run build`, this compiles the Typescript files into Javascript.

Webpack collate a formatted use-able plugin structure into the dist/ folder.
From this folder it can be side-loaded into Firefox or Chromium-based browsers.
