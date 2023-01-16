const { debug } = require('./compile-debug');
const { production } = require('./compile-production');
const { typeCheck } = require('./type-checking');

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
