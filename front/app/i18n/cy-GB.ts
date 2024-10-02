import cy from 'date-fns/locale/cy';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from '.';

registerLocale('cy-GB', cy);
addLocale('cy-GB', cy);
const cyGBAdminTranslationMessages = require('translations/admin/cy-GB.json');
const cyGBTranslationMessages = require('translations/cy-GB.json');
const translationMessages = formatTranslationMessages('cy-GB', {
  ...cyGBTranslationMessages,
  ...cyGBAdminTranslationMessages,
});

export default translationMessages;
