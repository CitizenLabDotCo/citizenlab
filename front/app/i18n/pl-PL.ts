import pl from 'date-fns/locale/pl';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('pl-PL', pl);
const plPLAdminTranslationMessages = require('translations/admin/pl-PL.json');
const plPLTranslationMessages = require('translations/pl-PL.json');
const translationMessages = formatTranslationMessages('pl-PL', {
  ...plPLTranslationMessages,
  ...plPLAdminTranslationMessages,
});

export default translationMessages;
