import sv from 'date-fns/locale/sv';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('sv-SE', sv);
const svSEAdminTranslationMessages = require('translations/admin/sv-SE.json');
const svSETranslationMessages = require('translations/sv-SE.json');
const translationMessages = formatTranslationMessages('sv-SE', {
  ...svSETranslationMessages,
  ...svSEAdminTranslationMessages,
});

export default translationMessages;
