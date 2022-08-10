import { formatTranslationMessages } from './';

const enTranslationMessages = require('translations/en.json');
const enAdminTranslationMessages = require('translations/admin/en.json');
const translationMessages = formatTranslationMessages('en', {
  ...enTranslationMessages,
  ...enAdminTranslationMessages,
});

export default translationMessages;
