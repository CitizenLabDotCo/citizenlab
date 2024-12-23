import frBE from 'date-fns/locale/fr';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('fr-BE', frBE);
addLocale('fr-BE', frBE);
const frBEAdminTranslationMessages = require('translations/admin/fr-BE.json');
const frBETranslationMessages = require('translations/fr-BE.json');
const translationMessages = formatTranslationMessages('fr-BE', {
  ...frBETranslationMessages,
  ...frBEAdminTranslationMessages,
});

export default translationMessages;
