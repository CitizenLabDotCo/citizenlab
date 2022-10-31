import { formatTranslationMessages } from './';

const nlBETranslationMessages = require('translations/nl-BE.json');
const nlBEAdminTranslationMessages = require('translations/admin/nl-BE.json');
const translationMessages = formatTranslationMessages('nl-BE', {
  ...nlBETranslationMessages,
  ...nlBEAdminTranslationMessages,
});

export default translationMessages;
