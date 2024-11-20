import { formatTranslationMessages } from '.';

const urPKAdminTranslationMessages = require('translations/admin/ur-PK.json');
const urPKTranslationMessages = require('translations/ur-PK.json');
const translationMessages = formatTranslationMessages('ur-PK', {
  ...urPKTranslationMessages,
  ...urPKAdminTranslationMessages,
});

export default translationMessages;
