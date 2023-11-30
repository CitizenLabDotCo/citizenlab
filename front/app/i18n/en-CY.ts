import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import cy from 'date-fns/locale/cy';

registerLocale('en-CY', cy);
const enCYTranslationMessages = require('translations/en-CY.json');
const enCYAdminTranslationMessages = require('translations/admin/en-CY.json');
const translationMessages = formatTranslationMessages('en-CY', {
  ...enCYTranslationMessages,
  ...enCYAdminTranslationMessages,
});

export default translationMessages;
