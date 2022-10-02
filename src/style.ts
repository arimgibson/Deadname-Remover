import { UserSettings } from './types';

export default function setStyle(document): void {
  if (document.querySelector('style[deadname]')) return;
  // Will be replaced by call to storage
  const theme: UserSettings['theme'] = 'non-binary';
  const backgroundStyling = {
    'non-binary': 'linear-gradient(90deg, rgb(255, 244, 48) 0%, white 25%, rgb(156, 89, 209) 50%, white 75%, rgb(255, 244, 48) 100%)',
    trans: 'linear-gradient(90deg, rgba(85,205,252) 0%, rgb(247,168,184) 25%, white 50%, rgb(247,168,184) 75%, rgb(85,205,252) 100%)',
  };

  if (theme === 'non-binary' || theme === 'trans') {
    const style: Element = document.createElement('style');
    style.setAttribute('deadname', '');
    style.innerHTML = ` 
  /* Styling for the Ari's Deadname Remover extension. Selection based on attribute to avoid styling conflicts based on class. */
  mark[deadname] {
    background: ${backgroundStyling[theme]};
  }
  `;
    document.head.appendChild(style);
  }
}
