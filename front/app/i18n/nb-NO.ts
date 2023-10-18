import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import nb from 'date-fns/locale/nb';

registerLocale('nb-NO', nb);
const nbNOTranslationMessages = require('translations/nb-NO.json');
const nbNOAdminTranslationMessages = require('translations/admin/nb-NO.json');
const translationMessages = formatTranslationMessages('nb-NO', {
  ...nbNOTranslationMessages,
  ...nbNOAdminTranslationMessages,
});

export default translationMessages;
