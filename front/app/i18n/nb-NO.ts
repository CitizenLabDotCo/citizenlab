import { formatTranslationMessages } from './';

const nbNOTranslationMessages = require('translations/nb-NO.json');
const nbNOAdminTranslationMessages = require('translations/admin/nb-NO.json');
const translationMessages = formatTranslationMessages('nb-NO', {
  ...nbNOTranslationMessages,
  ...nbNOAdminTranslationMessages,
});

export default translationMessages;
