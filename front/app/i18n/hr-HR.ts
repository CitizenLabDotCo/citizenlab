import { formatTranslationMessages } from './';

const hrHRTranslationMessages = require('translations/hr-HR.json');
const hrHRAdminTranslationMessages = require('translations/admin/hr-HR.json');
const translationMessages = formatTranslationMessages('hr-HR', {
  ...hrHRTranslationMessages,
  ...hrHRAdminTranslationMessages,
});

export default translationMessages;
