import { addLocaleData } from 'react-intl';
import plLocaleData from 'react-intl/locale-data/pl';

import { formatTranslationMessages } from './';

addLocaleData(plLocaleData);

const plPLTranslationMessages = require('translations/pl-PL.json');
const plPLAdminTranslationMessages = require('translations/admin/pl-PL.json');
const translationMessages = formatTranslationMessages('pl-PL', {
  ...plPLTranslationMessages,
  ...plPLAdminTranslationMessages,
});

export default translationMessages;
