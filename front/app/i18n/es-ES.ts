import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

registerLocale('es-ES', es);
const esESTranslationMessages = require('translations/es-ES.json');
const esESAdminTranslationMessages = require('translations/admin/es-ES.json');
const translationMessages = formatTranslationMessages('es-ES', {
  ...esESTranslationMessages,
  ...esESAdminTranslationMessages,
});

export default translationMessages;
