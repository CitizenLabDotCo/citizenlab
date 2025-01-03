import da from 'date-fns/locale/da';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('da-DK', da);
const daDKAdminTranslationMessages = require('translations/admin/da-DK.json');
const daDKTranslationMessages = require('translations/da-DK.json');
const translationMessages = formatTranslationMessages('da-DK', {
  ...daDKTranslationMessages,
  ...daDKAdminTranslationMessages,
});

export default translationMessages;
