import lv from 'date-fns/locale/lv';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('lv-LV', lv);
const lvLVAdminTranslationMessages = require('translations/admin/lv-LV.json');
const lvLVTranslationMessages = require('translations/lv-LV.json');
const translationMessages = formatTranslationMessages('lv-LV', {
  ...lvLVTranslationMessages,
  ...lvLVAdminTranslationMessages,
});

export default translationMessages;
