import ro from 'date-fns/locale/ro';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('ro-RO', ro);
const roROAdminTranslationMessages = require('translations/admin/ro-RO.json');
const roROTranslationMessages = require('translations/ro-RO.json');
const translationMessages = formatTranslationMessages('ro-RO', {
  ...roROTranslationMessages,
  ...roROAdminTranslationMessages,
});

export default translationMessages;
