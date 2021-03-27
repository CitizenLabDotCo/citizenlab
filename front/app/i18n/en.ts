import { formatTranslationMessages } from './';

// no need to call addLocaleData(enLocaleData) here because it happens by default in index.ts

const enTranslationMessages = require('translations/en.json');
const translationMessages = formatTranslationMessages(
  'en',
  enTranslationMessages
);

export default translationMessages;
