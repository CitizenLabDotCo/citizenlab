import el from 'date-fns/locale/el';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('el-GR', el);
addLocale('el-GR', el);
const elGRAdminTranslationMessages = require('translations/admin/el-GR.json');
const elGRTranslationMessages = require('translations/el-GR.json');
const translationMessages = formatTranslationMessages('el-GR', {
  ...elGRTranslationMessages,
  ...elGRAdminTranslationMessages,
});

export default translationMessages;
