import nb from 'date-fns/locale/nb';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('nb-NO', nb);
const nbNOAdminTranslationMessages = require('translations/admin/nb-NO.json');
const nbNOTranslationMessages = require('translations/nb-NO.json');
const translationMessages = formatTranslationMessages('nb-NO', {
  ...nbNOTranslationMessages,
  ...nbNOAdminTranslationMessages,
});

export default translationMessages;
