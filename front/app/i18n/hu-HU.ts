import hu from 'date-fns/locale/hu';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('hu-HU', hu);
addLocale('hu-HU', hu);
const huHUAdminTranslationMessages = require('translations/admin/hu-HU.json');
const huHUTranslationMessages = require('translations/hu-HU.json');
const translationMessages = formatTranslationMessages('hu-HU', {
  ...huHUTranslationMessages,
  ...huHUAdminTranslationMessages,
});

export default translationMessages;
