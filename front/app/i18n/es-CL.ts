import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

registerLocale('es-CL', es);
const esCLTranslationMessages = require('translations/es-CL.json');
const esCLAdminTranslationMessages = require('translations/admin/es-CL.json');
const translationMessages = formatTranslationMessages('es-CL', {
  ...esCLTranslationMessages,
  ...esCLAdminTranslationMessages,
});

export default translationMessages;
