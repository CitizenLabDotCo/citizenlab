import { addLocaleData } from 'react-intl';
import ptLocaleData from 'react-intl/locale-data/pt';

import { formatTranslationMessages } from './';

addLocaleData(ptLocaleData);

const ptBRTranslationMessages = require('translations/pt-BR.json');
const ptBRAdminTranslationMessages = require('translations/admin/pt-BR.json');
const translationMessages = formatTranslationMessages('pt-BR', {
  ...ptBRTranslationMessages,
  ...ptBRAdminTranslationMessages,
});

export default translationMessages;
