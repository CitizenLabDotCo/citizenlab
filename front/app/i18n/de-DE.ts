import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import de from 'date-fns/locale/de';

registerLocale('de-DE', de);
const deDETranslationMessages = require('translations/de-DE.json');
const deDEAdminTranslationMessages = require('translations/admin/de-DE.json');
const translationMessages = formatTranslationMessages('de-DE', {
  ...deDETranslationMessages,
  ...deDEAdminTranslationMessages,
});

export default translationMessages;
