import { formatTranslationMessages } from './';

const huHUTranslationMessages = require('translations/hu-HU.json');
const huHUAdminTranslationMessages = require('translations/admin/hu-HU.json');
const translationMessages = formatTranslationMessages('hu-HU', {
  ...huHUTranslationMessages,
  ...huHUAdminTranslationMessages,
});

export default translationMessages;
