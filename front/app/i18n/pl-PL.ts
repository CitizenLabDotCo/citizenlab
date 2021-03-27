import { addLocaleData } from 'react-intl';
import plLocaleData from 'react-intl/locale-data/pl';

import { formatTranslationMessages } from './';

addLocaleData(plLocaleData);

const plPLTranslationMessages = require('translations/pl-PL.json');
const translationMessages = formatTranslationMessages(
  'pl-PL',
  plPLTranslationMessages
);

export default translationMessages;
