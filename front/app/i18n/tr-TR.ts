import tr from 'date-fns/locale/tr';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('tr-TR', tr);
const trTRAdminTranslationMessages = require('translations/admin/tr-TR.json');
const trTRTranslationMessages = require('translations/tr-TR.json');
const translationMessages = formatTranslationMessages('tr-TR', {
  ...trTRTranslationMessages,
  ...trTRAdminTranslationMessages,
});

export default translationMessages;
