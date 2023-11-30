import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';

registerLocale('en-GB', enGB);
const enTranslationMessages = require('translations/en.json');
const enAdminTranslationMessages = require('translations/admin/en.json');
const translationMessages = formatTranslationMessages('en', {
  ...enTranslationMessages,
  ...enAdminTranslationMessages,
});

export default translationMessages;
