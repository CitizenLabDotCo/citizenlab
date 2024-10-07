import pl from 'date-fns/locale/pl';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('pl-PL', pl);
addLocale('pl-PL', pl);
const plPLAdminTranslationMessages = require('translations/admin/pl-PL.json');
const plPLTranslationMessages = require('translations/pl-PL.json');
const translationMessages = formatTranslationMessages('pl-PL', {
  ...plPLTranslationMessages,
  ...plPLAdminTranslationMessages,
});

export default translationMessages;
