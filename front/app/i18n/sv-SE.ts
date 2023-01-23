import { formatTranslationMessages } from './';

const svSETranslationMessages = require('translations/sv-SE.json');
const svSEAdminTranslationMessages = require('translations/admin/sv-SE.json');
const translationMessages = formatTranslationMessages('sv-SE', {
  ...svSETranslationMessages,
  ...svSEAdminTranslationMessages,
});

export default translationMessages;
