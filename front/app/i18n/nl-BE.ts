import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import nlBE from 'date-fns/locale/nl-BE';

registerLocale('nl-BE', nlBE);
const nlBETranslationMessages = require('translations/nl-BE.json');
const nlBEAdminTranslationMessages = require('translations/admin/nl-BE.json');
const translationMessages = formatTranslationMessages('nl-BE', {
  ...nlBETranslationMessages,
  ...nlBEAdminTranslationMessages,
});

export default translationMessages;
