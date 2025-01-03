import nl from 'date-fns/locale/nl';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('nl-NL', nl);
const nlNLAdminTranslationMessages = require('translations/admin/nl-NL.json');
const nlNLTranslationMessages = require('translations/nl-NL.json');
const translationMessages = formatTranslationMessages('nl-NL', {
  ...nlNLTranslationMessages,
  ...nlNLAdminTranslationMessages,
});

export default translationMessages;
