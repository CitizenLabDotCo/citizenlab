import sr from 'date-fns/locale/sr';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('sr-SP', sr);
const srSPAdminTranslationMessages = require('translations/admin/sr-SP.json');
const srSPTranslationMessages = require('translations/sr-SP.json');
const translationMessages = formatTranslationMessages('sr-SP', {
  ...srSPTranslationMessages,
  ...srSPAdminTranslationMessages,
});

export default translationMessages;
