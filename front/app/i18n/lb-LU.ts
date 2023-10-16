import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import lb from 'date-fns/locale/lb';

registerLocale('lb-LU', lb);
const lbLUTranslationMessages = require('translations/lb-LU.json');
const lbLUAdminTranslationMessages = require('translations/admin/lb-LU.json');
const translationMessages = formatTranslationMessages('lb-LU', {
  ...lbLUTranslationMessages,
  ...lbLUAdminTranslationMessages,
});

export default translationMessages;
