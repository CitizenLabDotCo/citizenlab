import { addLocaleData } from 'react-intl';
import localeData from 'react-intl/locale-data/ar';

import { formatTranslationMessages } from './';

addLocaleData(localeData);

const translationMessages = formatTranslationMessages('ar-SA', {
  ...require('translations/ar-SA.json'),
  ...require('translations/admin/ar-SA.json'),
});

export default translationMessages;
