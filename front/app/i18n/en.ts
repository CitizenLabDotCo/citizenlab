import enGB from 'date-fns/locale/en-GB';
import enUS from 'date-fns/locale/en-US';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('en-GB', enGB);
addLocale('en', enUS);
const enAdminTranslationMessages = require('translations/admin/en.json');
const enTranslationMessages = require('translations/en.json');
const translationMessages = formatTranslationMessages('en', {
  ...enTranslationMessages,
  ...enAdminTranslationMessages,
});

export default translationMessages;
