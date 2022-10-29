import { formatTranslationMessages } from './';

const daDKTranslationMessages = require('translations/da-DK.json');
const daDKAdminTranslationMessages = require('translations/admin/da-DK.json');
const translationMessages = formatTranslationMessages('da-DK', {
  ...daDKTranslationMessages,
  ...daDKAdminTranslationMessages,
});

export default translationMessages;
