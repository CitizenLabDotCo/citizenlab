import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import nl from 'date-fns/locale/nl';

registerLocale('nl-NL', nl);
const nlNLTranslationMessages = require('translations/nl-NL.json');
const nlNLAdminTranslationMessages = require('translations/admin/nl-NL.json');
const translationMessages = formatTranslationMessages('nl-NL', {
  ...nlNLTranslationMessages,
  ...nlNLAdminTranslationMessages,
});

export default translationMessages;
