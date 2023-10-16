import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import it from 'date-fns/locale/it';

registerLocale('it-IT', it);
const itITTranslationMessages = require('translations/it-IT.json');
const itITAdminTranslationMessages = require('translations/admin/it-IT.json');
const translationMessages = formatTranslationMessages('it-IT', {
  ...itITTranslationMessages,
  ...itITAdminTranslationMessages,
});

export default translationMessages;
