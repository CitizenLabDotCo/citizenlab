import ro from 'date-fns/locale/ro';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('ro-RO', ro);
const roROAdminTranslationMessages = require('translations/admin/ro-RO.json');
const roROTranslationMessages = require('translations/ro-RO.json');
const translationMessages = formatTranslationMessages('ro-RO', {
  ...roROTranslationMessages,
  ...roROAdminTranslationMessages,
});

export default translationMessages;
