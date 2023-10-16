import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import pl from 'date-fns/locale/pl';

registerLocale('pl-PL', pl);
const plPLTranslationMessages = require('translations/pl-PL.json');
const plPLAdminTranslationMessages = require('translations/admin/pl-PL.json');
const translationMessages = formatTranslationMessages('pl-PL', {
  ...plPLTranslationMessages,
  ...plPLAdminTranslationMessages,
});

export default translationMessages;
