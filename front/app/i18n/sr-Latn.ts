import { addLocaleData } from 'react-intl';
import srLatn from 'react-intl/locale-data/sr';

import { formatTranslationMessages } from './';

addLocaleData(srLatn);

const srLatnranslationMessages = require('translations/sr-Latn.json');
const translationMessages = formatTranslationMessages(
  'sr-Latn',
  srLatnranslationMessages
);

export default translationMessages;
