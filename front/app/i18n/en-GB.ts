import { formatTranslationMessages } from './';

const enGBTranslationMessages = require('translations/en-GB.json');
const enGBAdminTranslationMessages = require('translations/admin/en-GB.json');
const translationMessages = formatTranslationMessages('en-GB', {
  ...enGBTranslationMessages,
  ...enGBAdminTranslationMessages,
});

export default translationMessages;
