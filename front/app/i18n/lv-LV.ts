import { formatTranslationMessages } from './';

const lvLVTranslationMessages = require('translations/lv-LV.json');
const lvLVAdminTranslationMessages = require('translations/admin/lv-LV.json');
const translationMessages = formatTranslationMessages('lv-LV', {
  ...lvLVTranslationMessages,
  ...lvLVAdminTranslationMessages,
});

export default translationMessages;
