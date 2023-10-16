import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import srLatn from 'date-fns/locale/sr-Latn';

registerLocale('sr-Latn', srLatn);
const srLatnTranslationMessages = require('translations/sr-Latn.json');
const srLatnAdminTranslationMessages = require('translations/admin/sr-Latn.json');
const translationMessages = formatTranslationMessages('sr-Latn', {
  ...srLatnTranslationMessages,
  ...srLatnAdminTranslationMessages,
});

export default translationMessages;
