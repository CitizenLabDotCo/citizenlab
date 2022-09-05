import { addLocaleData } from 'react-intl';
import ar from 'react-intl/locale-data/ar';

import { formatTranslationMessages } from './';

addLocaleData(ar);

const arMATranslationMessages = require('translations/ar-MA.json');
const arMAAdminTranslationMessages = require('translations/admin/ar-MA.json');
const translationMessages = formatTranslationMessages('ar-MA', {
  ...arMATranslationMessages,
  ...arMAAdminTranslationMessages,
});

export default translationMessages;
