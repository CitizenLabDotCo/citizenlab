import { addLocaleData } from 'react-intl';
import roLocaleData from 'react-intl/locale-data/ro';

import { formatTranslationMessages } from './';

addLocaleData(roLocaleData);

const roROTranslationMessages = require('translations/ro-RO.json');
const translationMessages = formatTranslationMessages(
  'ro-RO',
  roROTranslationMessages
);

export default translationMessages;
