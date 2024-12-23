import ptBR from 'date-fns/locale/pt-BR';
import { registerLocale } from 'react-datepicker';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

registerLocale('pt-BR', ptBR);
addLocale('pt-BR', ptBR);
const ptBRAdminTranslationMessages = require('translations/admin/pt-BR.json');
const ptBRTranslationMessages = require('translations/pt-BR.json');
const translationMessages = formatTranslationMessages('pt-BR', {
  ...ptBRTranslationMessages,
  ...ptBRAdminTranslationMessages,
});

export default translationMessages;
