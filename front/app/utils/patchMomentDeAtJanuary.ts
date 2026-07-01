import moment from 'moment-timezone';

/**
 * moment's built-in `de-at` locale renders January as "Jänner"; we display
 * "Januar" for de-AT instead. This mirrors the date-fns override in
 * `i18n/de-AT.ts` so both date libraries agree on the month name.
 *
 * Must be called *after* moment's `de-at` locale file has been loaded (its
 * definition is what we merge the override onto). It is idempotent and a no-op
 * if the locale isn't loaded or has already been patched.
 */
export default function patchMomentDeAtJanuary(): void {
  const months = [...moment.localeData('de-at').months()];
  if (months[0] !== 'Jänner') return;

  months[0] = 'Januar';
  // `updateLocale` switches moment's global locale to 'de-at' as a side effect,
  // so capture the current one and restore it afterwards.
  const currentLocale = moment.locale();
  moment.updateLocale('de-at', { months });
  moment.locale(currentLocale);
}
