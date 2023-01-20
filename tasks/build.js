import { debug } from './compile-debug.js';
import { production } from './compile-production.js';
import { typeCheck } from './type-checking.js';

async function run() {
  const args = process.argv.slice(2);
  typeCheck();
  if (args.includes('--debug')) {
    await debug();
  }
  if (args.includes('--production')) {
    await production();
  }
}

run();
