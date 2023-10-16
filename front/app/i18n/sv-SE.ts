import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import sv from 'date-fns/locale/sv';

registerLocale('sv-SE', sv);
const svSETranslationMessages = require('translations/sv-SE.json');
const svSEAdminTranslationMessages = require('translations/admin/sv-SE.json');
const translationMessages = formatTranslationMessages('sv-SE', {
  ...svSETranslationMessages,
  ...svSEAdminTranslationMessages,
});

export default translationMessages;
