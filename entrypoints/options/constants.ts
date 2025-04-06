export const faqs = [
  {
    question: 'How do I add multiple names?',
    answer: 'Click the "Add Name" button under each name type in the "Name Replacement" section to add as many names as you want. Each name should have a deadname and the proper name to replace it with.',
  },
  {
    question: 'Why aren\'t names being replaced in text inputs, forms, or other editable content?',
    answer: 'To prevent accidentally outing users, the extension doesn\'t replace text in input fields, forms, or editable content. This prevents accidental submission of replaced names in emails, messages, or documents. If there\'s a place your name isn\'t replaced but you think it should be, please submit a bug (see below).',
  },
  {
    question: 'What should I do if content shifts around when using the "Block Page Until Replacements Finished" feature?',
    answer: 'If you notice content jumping or shifting around the page when using the content blocking feature, please submit a bug (see below). Include the website URL and a description of what\'s happening to help someone fix it.',
  },
  {
    question: 'Why am I still seeing my deadname flash on the page, even with the "Content Blocking" feature enabled?',
    answer: 'Due to how some websites render content, it\'s possible to see a deadname flash on the screen briefly, especially after the initial page load. The extension is built to replace these as soon as possible, so if it flashes for more than a few seconds or never updates, please submit a bug (see below).',
  },
  {
    question: 'How do I report bugs or request features?',
    answer: 'You can submit bugs or feature requests through GitHub Issues or email. Visit <a class="link" href="https://github.com/arimgibson/deadname-remover/issues/new" target="_blank" rel="noreferrer">github.com/arimgibson/deadname-remover/issues</a> to create a new issue, or email <a class="link" href="mailto:hi@arigibson.com">hi@arigibson.com</a> if you prefer not to use GitHub. I\'ll add it in the GitHub Issues board for tracking and email you back the link to follow along.',
  },
] as const

export const deadnameErrorMessages = {
  emptyDeadname: 'Deadname must not be empty',
  emptyProperName: 'Proper name must not be empty',
  duplicate: 'Deadname already exists',
  self: 'Cannot set deadname to proper name',
  recursive: 'Cannot set deadname to a name that has already been replaced',
} as const

export const emailErrorMessages = {
  emptyDeadname: 'Old email must not be empty',
  emptyProperName: 'New email must not be empty',
  duplicate: 'Email already exists',
  self: 'Cannot set old email to new email',
  recursive: 'Cannot set old email to an email that has already been replaced',
  invalidEmail: 'Invalid email provided',
} as const
