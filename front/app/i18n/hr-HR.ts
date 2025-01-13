import hr from 'date-fns/locale/hr';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('hr-HR', hr);
const hrHRAdminTranslationMessages = require('translations/admin/hr-HR.json');
const hrHRTranslationMessages = require('translations/hr-HR.json');
const translationMessages = formatTranslationMessages('hr-HR', {
  ...hrHRTranslationMessages,
  ...hrHRAdminTranslationMessages,
});

export default translationMessages;
