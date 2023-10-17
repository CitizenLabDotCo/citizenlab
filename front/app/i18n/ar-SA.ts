import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import arSA from 'date-fns/locale/ar-SA';

registerLocale('ar-SA', arSA);
const translationMessages = formatTranslationMessages('ar-SA', {
  ...require('translations/ar-SA.json'),
  ...require('translations/admin/ar-SA.json'),
});

export default translationMessages;
