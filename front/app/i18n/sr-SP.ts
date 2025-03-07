import sr from 'date-fns/locale/sr';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('sr-SP', sr);
const srSPAdminTranslationMessages = require('translations/admin/sr-SP.json');
const srSPTranslationMessages = require('translations/sr-SP.json');
const translationMessages = formatTranslationMessages('sr-SP', {
  ...srSPTranslationMessages,
  ...srSPAdminTranslationMessages,
});

export default translationMessages;
