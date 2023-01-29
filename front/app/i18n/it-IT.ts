import { formatTranslationMessages } from './';

const itITTranslationMessages = require('translations/it-IT.json');
const itITAdminTranslationMessages = require('translations/admin/it-IT.json');
const translationMessages = formatTranslationMessages('it-IT', {
  ...itITTranslationMessages,
  ...itITAdminTranslationMessages,
});

export default translationMessages;
