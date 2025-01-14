import lb from 'date-fns/locale/lb';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('lb-LU', lb);
const lbLUAdminTranslationMessages = require('translations/admin/lb-LU.json');
const lbLUTranslationMessages = require('translations/lb-LU.json');
const translationMessages = formatTranslationMessages('lb-LU', {
  ...lbLUTranslationMessages,
  ...lbLUAdminTranslationMessages,
});

export default translationMessages;
