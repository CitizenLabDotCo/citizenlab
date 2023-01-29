import { formatTranslationMessages } from './';

const plPLTranslationMessages = require('translations/pl-PL.json');
const plPLAdminTranslationMessages = require('translations/admin/pl-PL.json');
const translationMessages = formatTranslationMessages('pl-PL', {
  ...plPLTranslationMessages,
  ...plPLAdminTranslationMessages,
});

export default translationMessages;
