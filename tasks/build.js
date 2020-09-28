const {debug} = require('./compile-debug');
const {production} = require('./compile-production');

async function run() {
    const args = process.argv.slice(2);
    if (args.includes('--debug')) {
        await debug();
    }
    if (args.includes('--production')) {
        await production();
    }
}

run();
