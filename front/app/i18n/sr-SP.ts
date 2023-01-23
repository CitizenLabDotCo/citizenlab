import { formatTranslationMessages } from './';

const srSPTranslationMessages = require('translations/sr-SP.json');
const srSPAdminTranslationMessages = require('translations/admin/sr-SP.json');
const translationMessages = formatTranslationMessages('sr-SP', {
  ...srSPTranslationMessages,
  ...srSPAdminTranslationMessages,
});

export default translationMessages;
