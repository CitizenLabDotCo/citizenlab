import deAT from 'date-fns/locale/de-AT';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('de-AT', deAT);
const deATAdminTranslationMessages = require('translations/admin/de-AT.json');
const deATTranslationMessages = require('translations/de-AT.json');
const translationMessages = formatTranslationMessages('de-AT', {
  ...deATTranslationMessages,
  ...deATAdminTranslationMessages,
});

export default translationMessages;
