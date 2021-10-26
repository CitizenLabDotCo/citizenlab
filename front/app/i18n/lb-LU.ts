import { addLocaleData } from 'react-intl';
import lbLU from 'react-intl/locale-data/lb';

import { formatTranslationMessages } from './';

addLocaleData(lbLU);

const lbLUTranslationMessages = require('translations/lb-LU.json');
const translationMessages = formatTranslationMessages(
  'lb-LU',
  lbLUTranslationMessages
);

export default translationMessages;
