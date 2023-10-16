import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import enUS from 'date-fns/locale/en-US';

registerLocale('en', enUS);
const enTranslationMessages = require('translations/en.json');
const enAdminTranslationMessages = require('translations/admin/en.json');
const translationMessages = formatTranslationMessages('en', {
  ...enTranslationMessages,
  ...enAdminTranslationMessages,
});

export default translationMessages;
