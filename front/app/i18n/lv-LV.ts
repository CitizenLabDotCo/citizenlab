import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import lv from 'date-fns/locale/lv';

registerLocale('lv-LV', lv);
const lvLVTranslationMessages = require('translations/lv-LV.json');
const lvLVAdminTranslationMessages = require('translations/admin/lv-LV.json');
const translationMessages = formatTranslationMessages('lv-LV', {
  ...lvLVTranslationMessages,
  ...lvLVAdminTranslationMessages,
});

export default translationMessages;
