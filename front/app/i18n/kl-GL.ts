import { formatTranslationMessages } from './';

const klGLAdminTranslationMessages = require('translations/admin/kl-GL.json');
const klGLTranslationMessages = require('translations/kl-GL.json');
const translationMessages = formatTranslationMessages('kl-GL', {
  ...klGLTranslationMessages,
  ...klGLAdminTranslationMessages,
});

export default translationMessages;
