# Dead-Name-Remover
An easy to use browser plugin to automatically replace dead names

# Build Instructions

Requirements:

 - Node v8.10.0
 - NPM
 - TypeScript
 - [Grunt](https://gruntjs.com/)

Navigate to the root directory, type `npm i` to install other dependencies, then run `grunt` to build the plugin.

This should compile the TypeScript to JavaScript, and then WebPack should collate everything in the ./build/ folder.

From there it should be ready to be loaded into Firefox or Google Chrome.
