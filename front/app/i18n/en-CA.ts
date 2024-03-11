import enCA from 'date-fns/locale/en-CA';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('en-CA', enCA);
const enCAAdminTranslationMessages = require('translations/admin/en-CA.json');
const enCATranslationMessages = require('translations/en-CA.json');
const translationMessages = formatTranslationMessages('en-CA', {
  ...enCATranslationMessages,
  ...enCAAdminTranslationMessages,
});

export default translationMessages;
