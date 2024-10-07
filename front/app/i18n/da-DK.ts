import da from 'date-fns/locale/da';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('da-DK', da);
addLocale('da-DK', da);
const daDKAdminTranslationMessages = require('translations/admin/da-DK.json');
const daDKTranslationMessages = require('translations/da-DK.json');
const translationMessages = formatTranslationMessages('da-DK', {
  ...daDKTranslationMessages,
  ...daDKAdminTranslationMessages,
});

export default translationMessages;
