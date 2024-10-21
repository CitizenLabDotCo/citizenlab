import nb from 'date-fns/locale/nb';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from '.';

registerLocale('nb', nb);
addLocale('nb', nb);
const nbNOAdminTranslationMessages = require('translations/admin/nb.json');
const nbNOTranslationMessages = require('translations/nb.json');
const translationMessages = formatTranslationMessages('nb', {
  ...nbNOTranslationMessages,
  ...nbNOAdminTranslationMessages,
});

export default translationMessages;
