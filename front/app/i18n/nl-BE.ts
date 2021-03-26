import { addLocaleData } from 'react-intl';
import nlLocaleData from 'react-intl/locale-data/nl';

import { formatTranslationMessages } from './';

addLocaleData(nlLocaleData);

const nlBETranslationMessages = require('translations/nl-BE.json');
const translationMessages = formatTranslationMessages(
  'nl-BE',
  nlBETranslationMessages
);

export default translationMessages;
