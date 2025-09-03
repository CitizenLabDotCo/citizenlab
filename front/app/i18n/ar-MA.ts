import arMA from 'date-fns/locale/ar-MA';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('ar-MA', arMA);
const arMAAdminTranslationMessages = require('translations/admin/ar-MA.json');
const arMATranslationMessages = require('translations/ar-MA.json');
const translationMessages = formatTranslationMessages('ar-MA', {
  ...arMATranslationMessages,
  ...arMAAdminTranslationMessages,
});

export default translationMessages;
