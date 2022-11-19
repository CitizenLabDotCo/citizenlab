import { formatTranslationMessages } from './';

const translationMessages = formatTranslationMessages('ar-SA', {
  ...require('translations/ar-SA.json'),
  ...require('translations/admin/ar-SA.json'),
});

export default translationMessages;
