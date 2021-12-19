import { addLocaleData } from 'react-intl';
import nlLocaleData from 'react-intl/locale-data/nl';

import { formatTranslationMessages } from './';

addLocaleData(nlLocaleData);

const nlNLTranslationMessages = require('translations/nl-NL.json');
const nlNLAdminTranslationMessages = require('translations/admin/nl-NL.json');
const translationMessages = formatTranslationMessages('nl-NL', {
  ...nlNLTranslationMessages,
  ...nlNLAdminTranslationMessages,
});

export default translationMessages;
