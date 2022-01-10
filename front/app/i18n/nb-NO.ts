import { addLocaleData } from 'react-intl';
import nbLocaleData from 'react-intl/locale-data/nb';

import { formatTranslationMessages } from './';

addLocaleData(nbLocaleData);

const nbNOTranslationMessages = require('translations/nb-NO.json');
const nbNOAdminTranslationMessages = require('translations/admin/nb-NO.json');
const translationMessages = formatTranslationMessages('nb-NO', {
  ...nbNOTranslationMessages,
  ...nbNOAdminTranslationMessages,
});

export default translationMessages;
