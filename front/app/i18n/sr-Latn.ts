import { addLocaleData } from 'react-intl';
import srLatn from 'react-intl/locale-data/sr';

import { formatTranslationMessages } from './';

addLocaleData(srLatn);

const srLatnTranslationMessages = require('translations/sr-Latn.json');
const srLatnAdminTranslationMessages = require('translations/admin/sr-Latn.json');
const translationMessages = formatTranslationMessages('sr-Latn', {
  ...srLatnTranslationMessages,
  ...srLatnAdminTranslationMessages,
});

export default translationMessages;
