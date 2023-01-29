import { formatTranslationMessages } from './';

const nlNLTranslationMessages = require('translations/nl-NL.json');
const nlNLAdminTranslationMessages = require('translations/admin/nl-NL.json');
const translationMessages = formatTranslationMessages('nl-NL', {
  ...nlNLTranslationMessages,
  ...nlNLAdminTranslationMessages,
});

export default translationMessages;
