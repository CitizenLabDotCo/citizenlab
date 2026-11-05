import { formatTranslationMessages } from '.';

const gaIEAdminTranslationMessages = require('translations/admin/ga-IE.json');
const gaIETranslationMessages = require('translations/ga-IE.json');
const translationMessages = formatTranslationMessages('ga-IE', {
  ...gaIETranslationMessages,
  ...gaIEAdminTranslationMessages,
});

export default translationMessages;
