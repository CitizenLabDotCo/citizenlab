import de from 'date-fns/locale/de';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('de', de);
const deAdminTranslationMessages = require('translations/admin/de.json');
const deTranslationMessages = require('translations/de.json');
const translationMessages = formatTranslationMessages('de', {
  ...deTranslationMessages,
  ...deAdminTranslationMessages,
});

export default translationMessages;
