import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import fi from 'date-fns/locale/fi';

registerLocale('fi-FI', fi);
const fiFITranslationMessages = require('translations/fi-FI.json');
const fiFIAdminTranslationMessages = require('translations/admin/fi-FI.json');
const translationMessages = formatTranslationMessages('fi-FI', {
  ...fiFITranslationMessages,
  ...fiFIAdminTranslationMessages,
});

export default translationMessages;
