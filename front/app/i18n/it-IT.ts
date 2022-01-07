import { addLocaleData } from 'react-intl';
import itIT from 'react-intl/locale-data/it';

import { formatTranslationMessages } from './';

addLocaleData(itIT);

const itITTranslationMessages = require('translations/it-IT.json');
const itITAdminTranslationMessages = require('translations/admin/it-IT.json');
const translationMessages = formatTranslationMessages('it-IT', {
  ...itITTranslationMessages,
  ...itITAdminTranslationMessages,
});

export default translationMessages;
