import arSA from 'date-fns/locale/ar-SA';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('ar-SA', arSA);
const translationMessages = formatTranslationMessages('ar-SA', {
  ...require('translations/ar-SA.json'),
  ...require('translations/admin/ar-SA.json'),
});

export default translationMessages;
