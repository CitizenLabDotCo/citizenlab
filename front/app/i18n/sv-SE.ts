import sv from 'date-fns/locale/sv';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('sv-SE', sv);
addLocale('sv-SE', sv);
const svSEAdminTranslationMessages = require('translations/admin/sv-SE.json');
const svSETranslationMessages = require('translations/sv-SE.json');
const translationMessages = formatTranslationMessages('sv-SE', {
  ...svSETranslationMessages,
  ...svSEAdminTranslationMessages,
});

export default translationMessages;
