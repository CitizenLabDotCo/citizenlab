import es from 'date-fns/locale/es';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('es-CL', es);
addLocale('es-CL', es);
const esCLAdminTranslationMessages = require('translations/admin/es-CL.json');
const esCLTranslationMessages = require('translations/es-CL.json');
const translationMessages = formatTranslationMessages('es-CL', {
  ...esCLTranslationMessages,
  ...esCLAdminTranslationMessages,
});

export default translationMessages;
