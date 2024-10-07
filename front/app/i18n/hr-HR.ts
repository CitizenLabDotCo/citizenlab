import hr from 'date-fns/locale/hr';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('hr-HR', hr);
addLocale('hr-HR', hr);
const hrHRAdminTranslationMessages = require('translations/admin/hr-HR.json');
const hrHRTranslationMessages = require('translations/hr-HR.json');
const translationMessages = formatTranslationMessages('hr-HR', {
  ...hrHRTranslationMessages,
  ...hrHRAdminTranslationMessages,
});

export default translationMessages;
