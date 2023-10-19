import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import tr from 'date-fns/locale/tr';

registerLocale('tr-TR', tr);
const trTRTranslationMessages = require('translations/tr-TR.json');
const trTRAdminTranslationMessages = require('translations/admin/tr-TR.json');
const translationMessages = formatTranslationMessages('tr-TR', {
  ...trTRTranslationMessages,
  ...trTRAdminTranslationMessages,
});

export default translationMessages;
