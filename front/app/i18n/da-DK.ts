import { addLocaleData } from 'react-intl';
import daLocaleData from 'react-intl/locale-data/da';

import { formatTranslationMessages } from './';

addLocaleData(daLocaleData);

const daDKTranslationMessages = require('translations/da-DK.json');
const translationMessages = formatTranslationMessages(
  'da-DK',
  daDKTranslationMessages
);

export default translationMessages;
