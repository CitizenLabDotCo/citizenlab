import { addLocaleData } from 'react-intl';
import nlLocaleData from 'react-intl/locale-data/nl';

import { formatTranslationMessages } from './';

addLocaleData(nlLocaleData);

const nlBETranslationMessages = require('translations/nl-BE.json');
const nlBEAdminTranslationMessages = require('translations/admin/nl-BE.json');
const translationMessages = formatTranslationMessages('nl-BE', {
  ...nlBETranslationMessages,
  ...nlBEAdminTranslationMessages,
});

export default translationMessages;
