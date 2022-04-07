import { addLocaleData } from 'react-intl';
import hr from 'react-intl/locale-data/hr';

import { formatTranslationMessages } from './';

addLocaleData(hr);

const hrHRTranslationMessages = require('translations/hr-HR.json');
const hrHRAdminTranslationMessages = require('translations/admin/hr-HR.json');
const translationMessages = formatTranslationMessages('hr-HR', {
  ...hrHRTranslationMessages,
  ...hrHRAdminTranslationMessages,
});

export default translationMessages;
