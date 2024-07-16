import de from 'date-fns/locale/de';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('de-DE', de);
const deDEAdminTranslationMessages = require('translations/admin/de-DE.json');
const deDETranslationMessages = require('translations/de-DE.json');
const translationMessages = formatTranslationMessages('de-DE', {
  ...deDETranslationMessages,
  ...deDEAdminTranslationMessages,
});

export default translationMessages;
