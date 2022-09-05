import { addLocaleData } from 'react-intl';
import esLocaleData from 'react-intl/locale-data/es';

import { formatTranslationMessages } from './';

addLocaleData(esLocaleData);

const esESTranslationMessages = require('translations/es-ES.json');
const esESAdminTranslationMessages = require('translations/admin/es-ES.json');
const translationMessages = formatTranslationMessages('es-ES', {
  ...esESTranslationMessages,
  ...esESAdminTranslationMessages,
});

export default translationMessages;
