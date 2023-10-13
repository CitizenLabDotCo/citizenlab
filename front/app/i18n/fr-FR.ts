import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import frFR from 'date-fns/locale/fr';

registerLocale('fr-FR', frFR);
const frFRTranslationMessages = require('translations/fr-FR.json');
const frFRAdminTranslationMessages = require('translations/admin/fr-FR.json');
const translationMessages = formatTranslationMessages('fr-FR', {
  ...frFRTranslationMessages,
  ...frFRAdminTranslationMessages,
});

export default translationMessages;
