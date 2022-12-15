import { formatTranslationMessages } from './';

const trTRTranslationMessages = require('translations/tr-TR.json');
const trTRAdminTranslationMessages = require('translations/admin/tr-TR.json');
const translationMessages = formatTranslationMessages('tr-TR', {
  ...trTRTranslationMessages,
  ...trTRAdminTranslationMessages,
});

export default translationMessages;
