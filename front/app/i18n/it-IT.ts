import { addLocaleData } from 'react-intl';
import itIT from 'react-intl/locale-data/it';

import { formatTranslationMessages } from './';

addLocaleData(itIT);

const itITTranslationMessages = require('translations/it-IT.json');
const translationMessages = formatTranslationMessages(
  'it-IT',
  itITTranslationMessages
);

export default translationMessages;
