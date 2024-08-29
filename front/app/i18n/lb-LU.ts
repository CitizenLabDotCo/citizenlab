import lb from 'date-fns/locale/lb';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('lb-LU', lb);
const lbLUAdminTranslationMessages = require('translations/admin/lb-LU.json');
const lbLUTranslationMessages = require('translations/lb-LU.json');
const translationMessages = formatTranslationMessages('lb-LU', {
  ...lbLUTranslationMessages,
  ...lbLUAdminTranslationMessages,
});

export default translationMessages;
