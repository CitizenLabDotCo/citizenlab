import { formatTranslationMessages } from './';

const frFRTranslationMessages = require('translations/fr-FR.json');
const frFRAdminTranslationMessages = require('translations/admin/fr-FR.json');
const translationMessages = formatTranslationMessages('fr-FR', {
  ...frFRTranslationMessages,
  ...frFRAdminTranslationMessages,
});

export default translationMessages;
