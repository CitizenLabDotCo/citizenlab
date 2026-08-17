import { useMemo } from 'react';

import useLocale from 'hooks/useLocale';

import {
  DateInput,
  formatLongDate,
  formatShortDate,
  formatTime,
  formatDateTime,
  formatMonth,
  formatMonthShort,
  formatWeekday,
  formatTimeZoneAbbreviation,
} from 'utils/dateFormat';

/**
 * Localized date formatters bound to the active locale.
 *
 * This is how components should format dates. The underlying functions in
 * `utils/dateFormat` all take an explicit locale; this hook supplies it from
 * the intl context so a language switch re-renders the dates with it.
 *
 * Non-component code (parsers, `api/` helpers, chart data prep) cannot use a
 * hook — those call the `utils/dateFormat` functions directly and take the
 * locale as a parameter from their caller. Machine formats like `toIsoDate`
 * need no locale at all and are always imported directly.
 *
 *   const formatDate = useFormatDate();
 *   formatDate.longDate(event.attributes.start_at);   // "22 March 2026"
 */
export default function useFormatDate() {
  const locale = useLocale();

  return useMemo(
    () => ({
      /** moment `LL` — "22 March 2026" */
      longDate: (value: DateInput) => formatLongDate(value, locale),
      /** moment `L` — "22/03/2026" */
      shortDate: (value: DateInput) => formatShortDate(value, locale),
      /** moment `LT` — "15:30" */
      time: (value: DateInput) => formatTime(value, locale),
      /** moment `LLL` — "22 March 2026 15:30" */
      dateTime: (value: DateInput) => formatDateTime(value, locale),
      /** moment `MMMM` — "March" */
      month: (value: DateInput) => formatMonth(value, locale),
      /** moment `MMM` — "Mar" */
      monthShort: (value: DateInput) => formatMonthShort(value, locale),
      /** moment `dddd` — "Sunday" */
      weekday: (value: DateInput) => formatWeekday(value, locale),
      /** moment `z` — "GMT+1" (moment rendered "CET"; see dateFormat.README.md) */
      timeZoneAbbreviation: (value: DateInput) =>
        formatTimeZoneAbbreviation(value, locale),
    }),
    [locale]
  );
}
