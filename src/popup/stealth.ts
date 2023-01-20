const port = chrome.runtime.connect({ name: 'popup' });

document.querySelector('input[type="button"]').addEventListener('click', () => {
  port.postMessage({ type: 'save-data', data: { stealthMode: (document.querySelector('.onoff-option') as HTMLInputElement).checked } });
});
