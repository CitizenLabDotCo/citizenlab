import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import cy from 'date-fns/locale/cy';

registerLocale('cy-GB', cy);
const cyGBTranslationMessages = require('translations/cy-GB.json');
const cyGBAdminTranslationMessages = require('translations/admin/cy-GB.json');
const translationMessages = formatTranslationMessages('cy-GB', {
  ...cyGBTranslationMessages,
  ...cyGBAdminTranslationMessages,
});

export default translationMessages;
