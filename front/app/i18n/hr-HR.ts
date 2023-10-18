import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import hr from 'date-fns/locale/hr';

registerLocale('hr-HR', hr);
const hrHRTranslationMessages = require('translations/hr-HR.json');
const hrHRAdminTranslationMessages = require('translations/admin/hr-HR.json');
const translationMessages = formatTranslationMessages('hr-HR', {
  ...hrHRTranslationMessages,
  ...hrHRAdminTranslationMessages,
});

export default translationMessages;
