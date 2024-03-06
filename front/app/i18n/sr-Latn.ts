import srLatn from 'date-fns/locale/sr-Latn';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('sr-Latn', srLatn);
const srLatnAdminTranslationMessages = require('translations/admin/sr-Latn.json');
const srLatnTranslationMessages = require('translations/sr-Latn.json');
const translationMessages = formatTranslationMessages('sr-Latn', {
  ...srLatnTranslationMessages,
  ...srLatnAdminTranslationMessages,
});

export default translationMessages;
