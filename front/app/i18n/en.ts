import { formatTranslationMessages } from './';

// no need to call addLocaleData(enLocaleData) here because it happens by default in index.ts

const enTranslationMessages = require('translations/en.json');
const enAdminTranslationMessages = require('translations/admin/en.json');
const translationMessages = formatTranslationMessages('en', {
  ...enTranslationMessages,
  ...enAdminTranslationMessages,
});

export default translationMessages;
