import { formatTranslationMessages } from './';

const arMATranslationMessages = require('translations/ar-MA.json');
const arMAAdminTranslationMessages = require('translations/admin/ar-MA.json');
const translationMessages = formatTranslationMessages('ar-MA', {
  ...arMATranslationMessages,
  ...arMAAdminTranslationMessages,
});

export default translationMessages;
