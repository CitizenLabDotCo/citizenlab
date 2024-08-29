import it from 'date-fns/locale/it';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('it-IT', it);
const itITAdminTranslationMessages = require('translations/admin/it-IT.json');
const itITTranslationMessages = require('translations/it-IT.json');
const translationMessages = formatTranslationMessages('it-IT', {
  ...itITTranslationMessages,
  ...itITAdminTranslationMessages,
});

export default translationMessages;
