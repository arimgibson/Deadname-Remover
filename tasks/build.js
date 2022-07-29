import { debug } from './compile-debug';
import { production } from './compile-production';
import { typeCheck } from './type-checking';

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
