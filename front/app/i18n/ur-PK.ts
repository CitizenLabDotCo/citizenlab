import { formatTranslationMessages } from '.';

const urAdminTranslationMessages = require('translations/admin/ur.json');
const urTranslationMessages = require('translations/ur.json');
const translationMessages = formatTranslationMessages('ur-PK', {
  ...urTranslationMessages,
  ...urAdminTranslationMessages,
});

export default translationMessages;
