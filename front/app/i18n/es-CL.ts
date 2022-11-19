import { formatTranslationMessages } from './';

const esCLTranslationMessages = require('translations/es-CL.json');
const esCLAdminTranslationMessages = require('translations/admin/es-CL.json');
const translationMessages = formatTranslationMessages('es-CL', {
  ...esCLTranslationMessages,
  ...esCLAdminTranslationMessages,
});

export default translationMessages;
