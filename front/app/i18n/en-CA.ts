import { formatTranslationMessages } from './';

const enCATranslationMessages = require('translations/en-CA.json');
const enCAAdminTranslationMessages = require('translations/admin/en-CA.json');
const translationMessages = formatTranslationMessages('en-CA', {
  ...enCATranslationMessages,
  ...enCAAdminTranslationMessages,
});

export default translationMessages;
