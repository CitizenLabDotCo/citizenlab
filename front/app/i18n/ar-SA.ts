import arSA from 'date-fns/locale/ar-SA';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('ar-SA', arSA);
addLocale('ar-SA', arSA);
const translationMessages = formatTranslationMessages('ar-SA', {
  ...require('translations/ar-SA.json'),
  ...require('translations/admin/ar-SA.json'),
});

export default translationMessages;
