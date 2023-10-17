import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';

registerLocale('en-GB', enGB);
const enGBTranslationMessages = require('translations/en-GB.json');
const enGBAdminTranslationMessages = require('translations/admin/en-GB.json');
const translationMessages = formatTranslationMessages('en-GB', {
  ...enGBTranslationMessages,
  ...enGBAdminTranslationMessages,
});

export default translationMessages;
