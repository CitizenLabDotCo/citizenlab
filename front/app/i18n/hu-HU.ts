import hu from 'date-fns/locale/hu';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('hu-HU', hu);
const huHUAdminTranslationMessages = require('translations/admin/hu-HU.json');
const huHUTranslationMessages = require('translations/hu-HU.json');
const translationMessages = formatTranslationMessages('hu-HU', {
  ...huHUTranslationMessages,
  ...huHUAdminTranslationMessages,
});

export default translationMessages;
