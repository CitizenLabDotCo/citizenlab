import ptBR from 'date-fns/locale/pt-BR';
import { registerLocale } from 'react-datepicker';

import { formatTranslationMessages } from './';

registerLocale('pt-BR', ptBR);
const ptBRAdminTranslationMessages = require('translations/admin/pt-BR.json');
const ptBRTranslationMessages = require('translations/pt-BR.json');
const translationMessages = formatTranslationMessages('pt-BR', {
  ...ptBRTranslationMessages,
  ...ptBRAdminTranslationMessages,
});

export default translationMessages;
