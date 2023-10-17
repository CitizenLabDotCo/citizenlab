import { formatTranslationMessages } from './';
import { registerLocale } from 'react-datepicker';
import hu from 'date-fns/locale/hu';

registerLocale('hu-HU', hu);
const huHUTranslationMessages = require('translations/hu-HU.json');
const huHUAdminTranslationMessages = require('translations/admin/hu-HU.json');
const translationMessages = formatTranslationMessages('hu-HU', {
  ...huHUTranslationMessages,
  ...huHUAdminTranslationMessages,
});

export default translationMessages;
