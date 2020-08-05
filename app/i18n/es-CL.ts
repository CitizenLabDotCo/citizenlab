import { addLocaleData } from 'react-intl';
import esLocaleData from 'react-intl/locale-data/es';

import { formatTranslationMessages } from './';

addLocaleData(esLocaleData);

const esCLTranslationMessages = require('translations/es-CL.json');
const translationMessages = formatTranslationMessages(
  'es-CL',
  esCLTranslationMessages
);

export default translationMessages;
