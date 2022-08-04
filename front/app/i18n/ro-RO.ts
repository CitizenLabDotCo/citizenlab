import { formatTranslationMessages } from './';

const roROTranslationMessages = require('translations/ro-RO.json');
const roROAdminTranslationMessages = require('translations/admin/ro-RO.json');
const translationMessages = formatTranslationMessages('ro-RO', {
  ...roROTranslationMessages,
  ...roROAdminTranslationMessages,
});

export default translationMessages;
