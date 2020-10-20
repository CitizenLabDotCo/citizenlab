import { addLocaleData } from 'react-intl';
import localeData from 'react-intl/locale-data/ar';

import { formatTranslationMessages } from './';

addLocaleData(localeData);

const translationMessages = formatTranslationMessages(
  'ar',
  require('translations/ar.json')
);

export default translationMessages;
