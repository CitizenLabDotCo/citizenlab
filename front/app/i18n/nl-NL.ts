import nl from 'date-fns/locale/nl';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DateRangePicker2/Calendar/locales';

import { formatTranslationMessages } from './';

registerLocale('nl-NL', nl);
addLocale('nl-NL', nl);
const nlNLAdminTranslationMessages = require('translations/admin/nl-NL.json');
const nlNLTranslationMessages = require('translations/nl-NL.json');
const translationMessages = formatTranslationMessages('nl-NL', {
  ...nlNLTranslationMessages,
  ...nlNLAdminTranslationMessages,
});

export default translationMessages;
