import nl from 'date-fns/locale/nl';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('nl-NL', nl);
const nlNLAdminTranslationMessages = require('translations/admin/nl-NL.json');
const nlNLTranslationMessages = require('translations/nl-NL.json');
const translationMessages = formatTranslationMessages('nl-NL', {
  ...nlNLTranslationMessages,
  ...nlNLAdminTranslationMessages,
});

export default translationMessages;
