import es from 'date-fns/locale/es';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('es-ES', es);
const esESAdminTranslationMessages = require('translations/admin/es-ES.json');
const esESTranslationMessages = require('translations/es-ES.json');
const translationMessages = formatTranslationMessages('es-ES', {
  ...esESTranslationMessages,
  ...esESAdminTranslationMessages,
});

export default translationMessages;
