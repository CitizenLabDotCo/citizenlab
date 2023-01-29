import { formatTranslationMessages } from './';

const elGRTranslationMessages = require('translations/el-GR.json');
const elGRAdminTranslationMessages = require('translations/admin/el-GR.json');
const translationMessages = formatTranslationMessages('el-GR', {
  ...elGRTranslationMessages,
  ...elGRAdminTranslationMessages,
});

export default translationMessages;
