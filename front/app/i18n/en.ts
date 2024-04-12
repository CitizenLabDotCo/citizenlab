import enGB from 'date-fns/locale/en-GB';
import enUS from 'date-fns/locale/en-US';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('en-GB', enGB);
registerLocale('en-US', enUS);
const enAdminTranslationMessages = require('translations/admin/en.json');
const enTranslationMessages = require('translations/en.json');
const translationMessages = formatTranslationMessages('en', {
  ...enTranslationMessages,
  ...enAdminTranslationMessages,
});

export default translationMessages;
