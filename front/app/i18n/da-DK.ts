import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import da from 'date-fns/locale/da';

registerLocale('da-DK', da);
const daDKTranslationMessages = require('translations/da-DK.json');
const daDKAdminTranslationMessages = require('translations/admin/da-DK.json');
const translationMessages = formatTranslationMessages('da-DK', {
  ...daDKTranslationMessages,
  ...daDKAdminTranslationMessages,
});

export default translationMessages;
