import { addLocaleData } from 'react-intl';
import srSP from 'react-intl/locale-data/sr';

import { formatTranslationMessages } from './';

addLocaleData(srSP);

const srSPTranslationMessages = require('translations/sr-SP.json');
const srSPAdminTranslationMessages = require('translations/admin/sr-SP.json');
const translationMessages = formatTranslationMessages('sr-SP', {
  ...srSPTranslationMessages,
  ...srSPAdminTranslationMessages,
});

export default translationMessages;
