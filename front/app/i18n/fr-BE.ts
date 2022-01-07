import { addLocaleData } from 'react-intl';
import frLocaleData from 'react-intl/locale-data/fr';

import { formatTranslationMessages } from './';

addLocaleData(frLocaleData);

const frBETranslationMessages = require('translations/fr-BE.json');
const frBEAdminTranslationMessages = require('translations/admin/fr-BE.json');
const translationMessages = formatTranslationMessages('fr-BE', {
  ...frBETranslationMessages,
  ...frBEAdminTranslationMessages,
});

export default translationMessages;
