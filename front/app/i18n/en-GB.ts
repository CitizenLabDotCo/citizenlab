import enGB from 'date-fns/locale/en-GB';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('en-GB', enGB);
const enGBAdminTranslationMessages = require('translations/admin/en-GB.json');
const enGBTranslationMessages = require('translations/en-GB.json');
const translationMessages = formatTranslationMessages('en-GB', {
  ...enGBTranslationMessages,
  ...enGBAdminTranslationMessages,
});

export default translationMessages;
