import enIE from 'date-fns/locale/en-IE';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('en-IE', enIE);
const enIEAdminTranslationMessages = require('translations/admin/en-IE.json');
const enIETranslationMessages = require('translations/en-IE.json');
const translationMessages = formatTranslationMessages('en-IE', {
  ...enIETranslationMessages,
  ...enIEAdminTranslationMessages,
});

export default translationMessages;
