import enGB from 'date-fns/locale/en-GB';
import enUS from 'date-fns/locale/en-US';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('en-GB', enGB);
registerLocale('en-US', enUS);
addLocale('en-GB', enGB);
addLocale('en', enUS);
const enAdminTranslationMessages = require('translations/admin/en.json');
const enTranslationMessages = require('translations/en.json');
const translationMessages = formatTranslationMessages('en', {
  ...enTranslationMessages,
  ...enAdminTranslationMessages,
});

export default translationMessages;
