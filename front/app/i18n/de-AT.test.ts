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

  it('renders the short January as "Jan"/"Jan." instead of "Jän"/"Jän."', () => {
    // Formatting abbreviated (MMM) keeps the period; standalone (LLL) has none.
    expect(format(january, 'MMM', { locale: deAT })).toBe('Jan.');
    expect(format(january, 'LLL', { locale: deAT })).toBe('Jan');
  });

  it('leaves other months and the narrow width untouched', () => {
    expect(format(new Date(2026, 1, 1), 'MMMM', { locale: deAT })).toBe(
      'Februar'
    );
    expect(format(new Date(2026, 1, 1), 'MMM', { locale: deAT })).toBe('Feb.');
    expect(format(january, 'MMMMM', { locale: deAT })).toBe('J');
  });
});
