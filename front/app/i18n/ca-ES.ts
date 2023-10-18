import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import ca from 'date-fns/locale/ca';

registerLocale('ca-ES', ca);
const caESTranslationMessages = require('translations/ca-ES.json');
const caESAdminTranslationMessages = require('translations/admin/ca-ES.json');
const translationMessages = formatTranslationMessages('ca-ES', {
  ...caESTranslationMessages,
  ...caESAdminTranslationMessages,
});

export default translationMessages;
