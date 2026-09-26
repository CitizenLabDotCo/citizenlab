/**
 * CHARACTERIZATION BASELINE — moment date formatting.
 *
 * This suite exists for the moment → date-fns migration. It does not assert
 * that any particular output is *correct*; it pins down what moment currently
 * produces so that the date-fns replacement can be proven to produce the same
 * thing. A snapshot diff here is the migration telling you a user-visible
 * string changed in some language nobody on the team reads.
 *
 * Two independent grids rather than a full cross-product:
 *
 *   Grid A — every locale × every format, at one timezone and two dates.
 *            Catches per-language wording, word order and month/weekday names.
 *   Grid B — every timezone × every edge date × every format, at four
 *            representative locales. Catches instant→wall-clock conversion,
 *            DST, and date shifts across midnight.
 *
 * NOT COVERED (deliberate): the full locale × timezone × date cross-product,
 * which would be ~8.5k cells. Locale affects wording and timezone affects the
 * instant, and those are close to orthogonal — the one place they genuinely
 * interact is the `z` abbreviation, which Grid B covers across its four
 * locales. If a future bug shows a locale-specific timezone problem, widen
 * Grid B's locale set rather than merging the grids.
 *
 * Every instant below is a fixed UTC string. Nothing here reads the clock, so
 * the snapshots are stable.
 */
import moment from 'moment-timezone';

import { appLocalesMomentPairs } from 'containers/App/constants';

import patchMomentDeAtJanuary from '../patchMomentDeAtJanuary';

// The moment locales the app can actually load, deduplicated — several app
// locales share one moment locale (fr-BE and fr-FR both use `fr`). 'en' is
// moment's built-in default and never appears in the pairs map.
const MOMENT_LOCALES = [
  'en',
  ...new Set(Object.values(appLocalesMomentPairs)),
].sort();

// Every format string that appears in the codebase today, plus `dddd` as a
// high-signal locale probe (weekday names differ in every language).
const FORMATS = [
  'YYYY-MM-DD', // machine format — 73 call sites, must never localize
  'L', // localized numeric date — the 22/03 vs 03/22 case
  'LL', // localized long date
  'LLL', // localized long date + time
  'LT', // localized time
  'MMMM Do, YYYY',
  'MMM',
  'MMMM',
  'dddd',
  'HH:mm:ss',
  'z', // timezone abbreviation (CET, -03) — no direct date-fns equivalent
  'Z', // timezone offset (+01:00)
] as const;

const INSTANTS = {
  ordinary: '2026-03-22T14:30:00Z',
  // Brussels jumps 02:00 -> 03:00 at 01:00 UTC on the last Sunday of March.
  euDstSpringForward: '2026-03-29T01:30:00Z',
  // Brussels falls back 03:00 -> 02:00 at 01:00 UTC on the last Sunday of October.
  euDstFallBack: '2026-10-25T00:30:00Z',
  // 23:30 UTC on 31 Dec is already 1 Jan in Brussels but still 31 Dec in
  // Santiago — the clearest test that the display timezone is respected.
  yearBoundaryDec31: '2025-12-31T23:30:00Z',
  yearBoundaryJan01: '2026-01-01T00:30:00Z',
  // 29 Dec 2025 is a Monday in ISO week 1 of 2026, so the ISO week-numbering
  // year (2026) differs from the calendar year (2025). This is the date that
  // catches a `YYYY` (week-year) vs `yyyy` (calendar year) mix-up in date-fns.
  isoWeekYearTrap: '2025-12-29T12:00:00Z',
  // Chile's DST runs opposite to Europe's.
  chileDst: '2026-09-06T05:00:00Z',
  // January, to pin the de-AT "Januar" not "Jänner" override.
  january: '2026-01-05T14:30:00Z',
} as const;

const TIMEZONES = ['Europe/Brussels', 'UTC', 'America/Santiago'] as const;

// Default platform locale, a day-first English variant, the locale carrying our
// custom January patch, and an RTL locale.
const GRID_B_LOCALES = ['en', 'en-gb', 'de-at', 'ar-ma'];

const formatAll = (instant: string, locales: readonly string[]) =>
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      Object.fromEntries(
        FORMATS.map((format) => [
          format,
          moment(instant).locale(locale).format(format),
        ])
      ),
    ])
  );

beforeAll(() => {
  // The app loads these lazily per tenant (see localeGetter in
  // containers/App/constants) and patches de-at immediately afterwards. Do the
  // same here so the baseline reflects real app behaviour, not moment defaults.
  MOMENT_LOCALES.filter((locale) => locale !== 'en').forEach((locale) => {
    require(`moment/locale/${locale}`);
  });
  patchMomentDeAtJanuary();
  moment.locale('en');
});

afterAll(() => {
  moment.tz.setDefault();
});

describe('moment formatting baseline', () => {
  describe('Grid A — every locale × every format', () => {
    beforeEach(() => {
      // The tenant timezone in the app is set once via moment.tz.setDefault.
      moment.tz.setDefault('Europe/Brussels');
    });

    it('covers every supported locale', () => {
      // Guards the grid against silently shrinking if the locale map changes.
      expect(MOMENT_LOCALES.length).toBeGreaterThanOrEqual(33);
    });

    it('formats an ordinary date in every locale', () => {
      expect(formatAll(INSTANTS.ordinary, MOMENT_LOCALES)).toMatchSnapshot();
    });

    it('formats a January date in every locale (de-at override)', () => {
      expect(formatAll(INSTANTS.january, MOMENT_LOCALES)).toMatchSnapshot();
    });
  });

  describe('Grid B — every timezone × every edge date', () => {
    TIMEZONES.forEach((timezone) => {
      describe(timezone, () => {
        beforeEach(() => {
          moment.tz.setDefault(timezone);
        });

        Object.entries(INSTANTS).forEach(([name, instant]) => {
          it(`formats ${name} (${instant})`, () => {
            expect(formatAll(instant, GRID_B_LOCALES)).toMatchSnapshot();
          });
        });
      });
    });
  });
});
