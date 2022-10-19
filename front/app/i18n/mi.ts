import { formatTranslationMessages } from './';

const translationMessages = formatTranslationMessages('mi', {
  ...require('translations/mi.json'),
  ...require('translations/admin/mi.json'),
});

export default translationMessages;
