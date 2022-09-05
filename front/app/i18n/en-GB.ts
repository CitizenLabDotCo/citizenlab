import { formatTranslationMessages } from './';

// no need to call addLocaleData(enLocaleData) here because it happens by default in index.ts

const enGBTranslationMessages = require('translations/en-GB.json');
const enGBAdminTranslationMessages = require('translations/admin/en-GB.json');
const translationMessages = formatTranslationMessages('en-GB', {
  ...enGBTranslationMessages,
  ...enGBAdminTranslationMessages,
});

export default translationMessages;
