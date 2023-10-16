import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import ro from 'date-fns/locale/ro';

registerLocale('ro-RO', ro);
const roROTranslationMessages = require('translations/ro-RO.json');
const roROAdminTranslationMessages = require('translations/admin/ro-RO.json');
const translationMessages = formatTranslationMessages('ro-RO', {
  ...roROTranslationMessages,
  ...roROAdminTranslationMessages,
});

export default translationMessages;
