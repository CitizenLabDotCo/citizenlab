import nlBE from 'date-fns/locale/nl-BE';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('nl-BE', nlBE);
addLocale('nl-BE', nlBE);
const nlBEAdminTranslationMessages = require('translations/admin/nl-BE.json');
const nlBETranslationMessages = require('translations/nl-BE.json');
const translationMessages = formatTranslationMessages('nl-BE', {
  ...nlBETranslationMessages,
  ...nlBEAdminTranslationMessages,
});

export default translationMessages;
