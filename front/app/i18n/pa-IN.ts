import { formatTranslationMessages } from './';

const paINAdminTranslationMessages = require('translations/admin/pa-IN.json');
const paINTranslationMessages = require('translations/pa-IN.json');
const translationMessages = formatTranslationMessages('pa-IN', {
  ...paINTranslationMessages,
  ...paINAdminTranslationMessages,
});

export default translationMessages;
