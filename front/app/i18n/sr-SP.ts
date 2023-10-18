import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import sr from 'date-fns/locale/sr';

registerLocale('sr-SP', sr);
const srSPTranslationMessages = require('translations/sr-SP.json');
const srSPAdminTranslationMessages = require('translations/admin/sr-SP.json');
const translationMessages = formatTranslationMessages('sr-SP', {
  ...srSPTranslationMessages,
  ...srSPAdminTranslationMessages,
});

export default translationMessages;
