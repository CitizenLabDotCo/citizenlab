import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import enCA from 'date-fns/locale/en-CA';

registerLocale('en-CA', enCA);
const enCATranslationMessages = require('translations/en-CA.json');
const enCAAdminTranslationMessages = require('translations/admin/en-CA.json');
const translationMessages = formatTranslationMessages('en-CA', {
  ...enCATranslationMessages,
  ...enCAAdminTranslationMessages,
});

export default translationMessages;
