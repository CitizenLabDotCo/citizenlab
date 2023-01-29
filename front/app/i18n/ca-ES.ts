import { formatTranslationMessages } from './';

const caESTranslationMessages = require('translations/ca-ES.json');
const caESAdminTranslationMessages = require('translations/admin/ca-ES.json');
const translationMessages = formatTranslationMessages('ca-ES', {
  ...caESTranslationMessages,
  ...caESAdminTranslationMessages,
});

export default translationMessages;
