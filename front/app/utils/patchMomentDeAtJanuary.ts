import moment from 'moment-timezone';

/**
 * moment's built-in `de-at` locale renders January as "Jänner" (wide) / "Jän."
 * (short); we display "Januar" / "Jan." for de-AT instead. This mirrors the
 * date-fns override in `i18n/de-AT.ts` so both date libraries agree on the month
 * name.
 *
 * Must be called *after* moment's `de-at` locale file has been loaded (its
 * definition is what we merge the override onto). It is idempotent and a no-op
 * if the locale isn't loaded or has already been patched.
 */
export default function patchMomentDeAtJanuary(): void {
  const data = moment.localeData('de-at');
  const months = [...data.months()];
  const monthsShort = [...data.monthsShort()];
  if (months[0] !== 'Jänner' && monthsShort[0] !== 'Jän.') return;

  months[0] = 'Januar';
  monthsShort[0] = 'Jan.';
  // `updateLocale` switches moment's global locale to 'de-at' as a side effect,
  // so capture the current one and restore it afterwards.
  const currentLocale = moment.locale();
  moment.updateLocale('de-at', { months, monthsShort });
  moment.locale(currentLocale);
}
