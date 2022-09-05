import { addLocaleData } from 'react-intl';
import deLocaleData from 'react-intl/locale-data/de';

import { formatTranslationMessages } from './';

addLocaleData(deLocaleData);

const deDETranslationMessages = require('translations/de-DE.json');
const deDEAdminTranslationMessages = require('translations/admin/de-DE.json');
const translationMessages = formatTranslationMessages('de-DE', {
  ...deDETranslationMessages,
  ...deDEAdminTranslationMessages,
});

export default translationMessages;
