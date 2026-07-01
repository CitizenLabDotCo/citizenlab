import { Locale } from 'date-fns';
import deAT from 'date-fns/locale/de-AT';

import { addLocale } from 'components/admin/DatePickers/_shared/locales';

import { formatTranslationMessages } from '.';

// date-fns' de-AT locale renders January as "Jänner"; we display "Januar" for
// de-AT instead. Wrapping the locale's `month` localizer overrides the value on
// every code path date-fns uses to produce a month name (format tokens like
// MMMM/LLLL, and react-day-picker's month dropdown).
const { localize } = deAT;
const deATLocale: Locale = localize
  ? {
      ...deAT,
      localize: {
        ...localize,
        month: (...args: Parameters<typeof localize.month>) => {
          const month = localize.month(...args);
          return month === 'Jänner' ? 'Januar' : month;
        },
      },
    }
  : deAT;

addLocale('de-AT', deATLocale);
const deATAdminTranslationMessages = require('translations/admin/de-AT.json');
const deATTranslationMessages = require('translations/de-AT.json');
const translationMessages = formatTranslationMessages('de-AT', {
  ...deATTranslationMessages,
  ...deATAdminTranslationMessages,
});

export default translationMessages;
