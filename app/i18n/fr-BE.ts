import { addLocaleData } from 'react-intl';
import frLocaleData from 'react-intl/locale-data/fr';

import { formatTranslationMessages } from './';

addLocaleData(frLocaleData);

const frBETranslationMessages = require('translations/fr-BE.json');
const translationMessages = formatTranslationMessages(
  'fr-BE',
  frBETranslationMessages
);

export default translationMessages;
