import { addLocaleData } from 'react-intl';
import svSE from 'react-intl/locale-data/sv';

import { formatTranslationMessages } from './';

addLocaleData(svSE);

const svSETranslationMessages = require('translations/sv-SE.json');
const svSEAdminTranslationMessages = require('translations/admin/sv-SE.json');
const translationMessages = formatTranslationMessages('sv-SE', {
  ...svSETranslationMessages,
  ...svSEAdminTranslationMessages,
});

export default translationMessages;
