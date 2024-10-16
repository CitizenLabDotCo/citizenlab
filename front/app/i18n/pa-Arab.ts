import { formatTranslationMessages } from './';

const paArabAdminTranslationMessages = require('translations/admin/pa-Arab.json');
const paArabTranslationMessages = require('translations/pa-Arab.json');
const translationMessages = formatTranslationMessages('pa-Arab', {
  ...paArabTranslationMessages,
  ...paArabAdminTranslationMessages,
});

export default translationMessages;
