import el from 'date-fns/locale/el';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('el-GR', el);
const elGRAdminTranslationMessages = require('translations/admin/el-GR.json');
const elGRTranslationMessages = require('translations/el-GR.json');
const translationMessages = formatTranslationMessages('el-GR', {
  ...elGRTranslationMessages,
  ...elGRAdminTranslationMessages,
});

export default translationMessages;
