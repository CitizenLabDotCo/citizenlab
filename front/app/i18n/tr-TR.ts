import tr from 'date-fns/locale/tr';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('tr-TR', tr);
addLocale('tr-TR', tr);
const trTRAdminTranslationMessages = require('translations/admin/tr-TR.json');
const trTRTranslationMessages = require('translations/tr-TR.json');
const translationMessages = formatTranslationMessages('tr-TR', {
  ...trTRTranslationMessages,
  ...trTRAdminTranslationMessages,
});

export default translationMessages;
