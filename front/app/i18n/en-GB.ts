import enGB from 'date-fns/locale/en-GB';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('en-GB', enGB);
const enGBAdminTranslationMessages = require('translations/admin/en-GB.json');
const enGBTranslationMessages = require('translations/en-GB.json');
const translationMessages = formatTranslationMessages('en-GB', {
  ...enGBTranslationMessages,
  ...enGBAdminTranslationMessages,
});

export default translationMessages;
