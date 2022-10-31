import { formatTranslationMessages } from './';

const deDETranslationMessages = require('translations/de-DE.json');
const deDEAdminTranslationMessages = require('translations/admin/de-DE.json');
const translationMessages = formatTranslationMessages('de-DE', {
  ...deDETranslationMessages,
  ...deDEAdminTranslationMessages,
});

export default translationMessages;
