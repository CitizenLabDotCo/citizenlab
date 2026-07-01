import { format } from 'date-fns';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

// Importing the module registers the (overridden) de-AT date-fns locale via addLocale.
import 'i18n/de-AT';

describe('de-AT date-fns locale', () => {
  const deAT = getLocale('de-AT');
  const january = new Date(2026, 0, 15);

  it('renders January as "Januar" instead of date-fns\' default "Jänner"', () => {
    // Wide month (MMMM) and standalone wide month (LLLL) both flow through
    // localize.month and are the paths that produce the calendar month name.
    expect(format(january, 'MMMM', { locale: deAT })).toBe('Januar');
    expect(format(january, 'LLLL', { locale: deAT })).toBe('Januar');
    expect(format(january, 'MMMM', { locale: deAT })).not.toBe('Jänner');
  });

  it('leaves other months and non-wide widths of January untouched', () => {
    // Only the wide "Jänner" is overridden; everything else keeps the Austrian form.
    expect(format(new Date(2026, 1, 1), 'MMMM', { locale: deAT })).toBe(
      'Februar'
    );
    expect(format(january, 'MMM', { locale: deAT })).toBe('Jän.');
    expect(format(january, 'MMMMM', { locale: deAT })).toBe('J');
  });
});
