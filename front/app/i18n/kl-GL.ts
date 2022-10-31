import { formatTranslationMessages } from './';

const klGLTranslationMessages = require('translations/kl-GL.json');
const klGLAdminTranslationMessages = require('translations/admin/kl-GL.json');
const translationMessages = formatTranslationMessages('kl-GL', {
  ...klGLTranslationMessages,
  ...klGLAdminTranslationMessages,
});

export default translationMessages;
