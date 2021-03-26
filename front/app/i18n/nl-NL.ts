import { addLocaleData } from 'react-intl';
import nlLocaleData from 'react-intl/locale-data/nl';

import { formatTranslationMessages } from './';

addLocaleData(nlLocaleData);

const nlNLTranslationMessages = require('translations/nl-NL.json');
const translationMessages = formatTranslationMessages(
  'nl-NL',
  nlNLTranslationMessages
);

export default translationMessages;
