import fi from 'date-fns/locale/fi';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('fi-FI', fi);
const fiFIAdminTranslationMessages = require('translations/admin/fi-FI.json');
const fiFITranslationMessages = require('translations/fi-FI.json');
const translationMessages = formatTranslationMessages('fi-FI', {
  ...fiFITranslationMessages,
  ...fiFIAdminTranslationMessages,
});

export default translationMessages;
