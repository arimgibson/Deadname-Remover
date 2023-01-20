import { execFile } from 'child_process';
import { createRequire } from 'module';

export async function typeCheck() {
  await new Promise((resolve, reject) => {
    execFile(process.execPath, [createRequire(import.meta.url).resolve('typescript/lib/tsc.js'), '--project', 'tsconfig.json'], (err) => {
      if (err) {
        reject(new Error(`tsc has exited with error: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}
