import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';

registerLocale('pt-BR', ptBR);
const ptBRTranslationMessages = require('translations/pt-BR.json');
const ptBRAdminTranslationMessages = require('translations/admin/pt-BR.json');
const translationMessages = formatTranslationMessages('pt-BR', {
  ...ptBRTranslationMessages,
  ...ptBRAdminTranslationMessages,
});

export default translationMessages;
