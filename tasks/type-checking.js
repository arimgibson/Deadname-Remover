const { execFile } = require('child_process');

async function typeCheck() {
  await new Promise((resolve, reject) => {
    execFile(process.execPath, [require.resolve('typescript/lib/tsc.js'), '--project', 'tsconfig.json'], (err) => {
      if (err) {
        reject(new Error(`tsc has exited with error: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}

module.exports = { typeCheck };
