import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import el from 'date-fns/locale/el';

registerLocale('el-GR', el);
const elGRTranslationMessages = require('translations/el-GR.json');
const elGRAdminTranslationMessages = require('translations/admin/el-GR.json');
const translationMessages = formatTranslationMessages('el-GR', {
  ...elGRTranslationMessages,
  ...elGRAdminTranslationMessages,
});

export default translationMessages;
