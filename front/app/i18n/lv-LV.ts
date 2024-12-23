import lv from 'date-fns/locale/lv';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('lv-LV', lv);
addLocale('lv-LV', lv);
const lvLVAdminTranslationMessages = require('translations/admin/lv-LV.json');
const lvLVTranslationMessages = require('translations/lv-LV.json');
const translationMessages = formatTranslationMessages('lv-LV', {
  ...lvLVTranslationMessages,
  ...lvLVAdminTranslationMessages,
});

export default translationMessages;
