import ca from 'date-fns/locale/ca';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('ca-ES', ca);
const caESAdminTranslationMessages = require('translations/admin/ca-ES.json');
const caESTranslationMessages = require('translations/ca-ES.json');
const translationMessages = formatTranslationMessages('ca-ES', {
  ...caESTranslationMessages,
  ...caESAdminTranslationMessages,
});

export default translationMessages;
