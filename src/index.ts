import {start} from './inject';

if (!window.chrome) {
    window.chrome = {} as any;
}
if (!chrome.runtime) {
    chrome.runtime = {} as any;
}

const port = chrome.runtime.connect({name: 'tab'});
port.onMessage.addListener((settings) => {
    start(settings);
});
