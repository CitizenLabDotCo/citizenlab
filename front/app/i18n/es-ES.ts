import { formatTranslationMessages } from './';

const esESTranslationMessages = require('translations/es-ES.json');
const esESAdminTranslationMessages = require('translations/admin/es-ES.json');
const translationMessages = formatTranslationMessages('es-ES', {
  ...esESTranslationMessages,
  ...esESAdminTranslationMessages,
});

export default translationMessages;
