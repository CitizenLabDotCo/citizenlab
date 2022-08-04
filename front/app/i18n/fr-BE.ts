import { formatTranslationMessages } from './';

const frBETranslationMessages = require('translations/fr-BE.json');
const frBEAdminTranslationMessages = require('translations/admin/fr-BE.json');
const translationMessages = formatTranslationMessages('fr-BE', {
  ...frBETranslationMessages,
  ...frBEAdminTranslationMessages,
});

export default translationMessages;
