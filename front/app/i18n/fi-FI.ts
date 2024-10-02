import fi from 'date-fns/locale/fi';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('fi-FI', fi);
addLocale('fi-FI', fi);
const fiFIAdminTranslationMessages = require('translations/admin/fi-FI.json');
const fiFITranslationMessages = require('translations/fi-FI.json');
const translationMessages = formatTranslationMessages('fi-FI', {
  ...fiFITranslationMessages,
  ...fiFIAdminTranslationMessages,
});

export default translationMessages;
