import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import arMA from 'date-fns/locale/ar-MA';

registerLocale('ar-MA', arMA);
const arMATranslationMessages = require('translations/ar-MA.json');
const arMAAdminTranslationMessages = require('translations/admin/ar-MA.json');
const translationMessages = formatTranslationMessages('ar-MA', {
  ...arMATranslationMessages,
  ...arMAAdminTranslationMessages,
});

export default translationMessages;
