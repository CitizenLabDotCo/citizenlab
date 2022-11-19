import { formatTranslationMessages } from './';

const srLatnTranslationMessages = require('translations/sr-Latn.json');
const srLatnAdminTranslationMessages = require('translations/admin/sr-Latn.json');
const translationMessages = formatTranslationMessages('sr-Latn', {
  ...srLatnTranslationMessages,
  ...srLatnAdminTranslationMessages,
});

export default translationMessages;
