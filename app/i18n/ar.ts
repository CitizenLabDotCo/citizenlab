import { addLocaleData } from 'react-intl';
import roLocaleData from 'react-intl/locale-data/ar';

import { formatTranslationMessages } from './';

addLocaleData(roLocaleData);

const roROTranslationMessages = require('translations/ar.json');
const translationMessages = formatTranslationMessages(
  'ar',
  roROTranslationMessages
);

export default translationMessages;
