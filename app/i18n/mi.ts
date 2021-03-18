import { addLocaleData } from 'react-intl';
import localeData from 'react-intl/locale-data/mi';

import { formatTranslationMessages } from './';

addLocaleData(localeData);

const translationMessages = formatTranslationMessages(
  'mi',
  require('translations/mi.json')
);

export default translationMessages;
