import de from 'date-fns/locale/de';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('de-DE', de);
const deDEAdminTranslationMessages = require('translations/admin/de-DE.json');
const deDETranslationMessages = require('translations/de-DE.json');
const translationMessages = formatTranslationMessages('de-DE', {
  ...deDETranslationMessages,
  ...deDEAdminTranslationMessages,
});

export default translationMessages;
