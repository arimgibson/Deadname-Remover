import { MessageToTab } from './types';
import walk from './parser';
import setStyle from './style';

chrome.runtime.onMessage.addListener(async (message: MessageToTab) => {
  if (message.status === 'updated') {
    setStyle(document);
    walk(document);
  }
});
