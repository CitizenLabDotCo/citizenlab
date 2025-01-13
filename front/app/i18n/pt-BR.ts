import ptBR from 'date-fns/locale/pt-BR';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('pt-BR', ptBR);
const ptBRAdminTranslationMessages = require('translations/admin/pt-BR.json');
const ptBRTranslationMessages = require('translations/pt-BR.json');
const translationMessages = formatTranslationMessages('pt-BR', {
  ...ptBRTranslationMessages,
  ...ptBRAdminTranslationMessages,
});

export default translationMessages;
