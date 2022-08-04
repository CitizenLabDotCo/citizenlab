import { formatTranslationMessages } from './';

const lbLUTranslationMessages = require('translations/lb-LU.json');
const lbLUAdminTranslationMessages = require('translations/admin/lb-LU.json');
const translationMessages = formatTranslationMessages('lb-LU', {
  ...lbLUTranslationMessages,
  ...lbLUAdminTranslationMessages,
});

export default translationMessages;
