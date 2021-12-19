import { addLocaleData } from 'react-intl';
import esLocaleData from 'react-intl/locale-data/es';

import { formatTranslationMessages } from './';

addLocaleData(esLocaleData);

const esCLTranslationMessages = require('translations/es-CL.json');
const esCLAdminTranslationMessages = require('translations/admin/es-CL.json');
const translationMessages = formatTranslationMessages('es-CL', {
  ...esCLTranslationMessages,
  ...esCLAdminTranslationMessages,
});

export default translationMessages;
