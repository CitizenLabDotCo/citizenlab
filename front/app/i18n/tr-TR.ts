import { addLocaleData } from 'react-intl';
import trTR from 'react-intl/locale-data/tr';

import { formatTranslationMessages } from './';

addLocaleData(trTR);

const trTRTranslationMessages = require('translations/tr-TR.json');
const trTRAdminTranslationMessages = require('translations/admin/tr-TR.json');
const translationMessages = formatTranslationMessages('tr-TR', {
  ...trTRTranslationMessages,
  ...trTRAdminTranslationMessages,
});

export default translationMessages;
