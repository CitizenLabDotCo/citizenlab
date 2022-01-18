import { addLocaleData } from 'react-intl';
import frLocaleData from 'react-intl/locale-data/fr';

import { formatTranslationMessages } from './';

addLocaleData(frLocaleData);

const frFRTranslationMessages = require('translations/fr-FR.json');
const frFRAdminTranslationMessages = require('translations/admin/fr-FR.json');
const translationMessages = formatTranslationMessages('fr-FR', {
  ...frFRTranslationMessages,
  ...frFRAdminTranslationMessages,
});

export default translationMessages;
