import ltLT from 'date-fns/locale/lt';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from '.';

addLocale('lt-LT', ltLT);
const ltAdminTranslationMessages = require('translations/admin/lt-LT.json');
const ltTranslationMessages = require('translations/lt-LT.json');
const translationMessages = formatTranslationMessages('lt-LT', {
  ...ltTranslationMessages,
  ...ltAdminTranslationMessages,
});

export default translationMessages;
