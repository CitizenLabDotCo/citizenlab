import it from 'date-fns/locale/it';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('it-IT', it);
const itITAdminTranslationMessages = require('translations/admin/it-IT.json');
const itITTranslationMessages = require('translations/it-IT.json');
const translationMessages = formatTranslationMessages('it-IT', {
  ...itITTranslationMessages,
  ...itITAdminTranslationMessages,
});

export default translationMessages;
