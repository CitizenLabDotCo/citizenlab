import { addLocaleData } from 'react-intl';
import localeData from 'react-intl/locale-data/ar';

import { formatTranslationMessages } from './';

addLocaleData(localeData);

const translationMessages = formatTranslationMessages(
  'ar-SA',
  require('translations/ar-SA.json')
);

export default translationMessages;
