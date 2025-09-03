import frFR from 'date-fns/locale/fr';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from './';

addLocale('fr-FR', frFR);
const frFRAdminTranslationMessages = require('translations/admin/fr-FR.json');
const frFRTranslationMessages = require('translations/fr-FR.json');
const translationMessages = formatTranslationMessages('fr-FR', {
  ...frFRTranslationMessages,
  ...frFRAdminTranslationMessages,
});

export default translationMessages;
