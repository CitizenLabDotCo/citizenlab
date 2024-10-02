import enIE from 'date-fns/locale/en-IE';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('en-IE', enIE);
addLocale('en-IE', enIE);
const enIEAdminTranslationMessages = require('translations/admin/en-IE.json');
const enIETranslationMessages = require('translations/en-IE.json');
const translationMessages = formatTranslationMessages('en-IE', {
  ...enIETranslationMessages,
  ...enIEAdminTranslationMessages,
});

export default translationMessages;
