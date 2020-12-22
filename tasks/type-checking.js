const {exec} = require('child_process');

async function typeCheck() {
    await new Promise((resolve, reject) => {
        exec(`${process.execPath} ${require.resolve('typescript/lib/tsc.js')} --project "tsconfig.json"`, (err) => {
            if (err) {
                reject(new Error(`tsc exited with error: ${err}`));
            } else {
                resolve();
            }
        });
    });
}

module.exports = {typeCheck};
