import ca from 'date-fns/locale/ca';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('ca-ES', ca);
const caESAdminTranslationMessages = require('translations/admin/ca-ES.json');
const caESTranslationMessages = require('translations/ca-ES.json');
const translationMessages = formatTranslationMessages('ca-ES', {
  ...caESTranslationMessages,
  ...caESAdminTranslationMessages,
});

export default translationMessages;
