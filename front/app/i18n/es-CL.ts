import es from 'date-fns/locale/es';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('es-CL', es);
const esCLAdminTranslationMessages = require('translations/admin/es-CL.json');
const esCLTranslationMessages = require('translations/es-CL.json');
const translationMessages = formatTranslationMessages('es-CL', {
  ...esCLTranslationMessages,
  ...esCLAdminTranslationMessages,
});

export default translationMessages;
