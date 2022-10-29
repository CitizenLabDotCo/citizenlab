import { formatTranslationMessages } from './';

const ptBRTranslationMessages = require('translations/pt-BR.json');
const ptBRAdminTranslationMessages = require('translations/admin/pt-BR.json');
const translationMessages = formatTranslationMessages('pt-BR', {
  ...ptBRTranslationMessages,
  ...ptBRAdminTranslationMessages,
});

export default translationMessages;
