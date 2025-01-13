import enCA from 'date-fns/locale/en-CA';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('en-CA', enCA);
const enCAAdminTranslationMessages = require('translations/admin/en-CA.json');
const enCATranslationMessages = require('translations/en-CA.json');
const translationMessages = formatTranslationMessages('en-CA', {
  ...enCATranslationMessages,
  ...enCAAdminTranslationMessages,
});

export default translationMessages;
