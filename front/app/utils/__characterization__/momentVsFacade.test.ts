/**
 * DELTA REPORT — moment vs the date-fns/Intl façade.
 *
 * The companion to dateFormats.test.ts. That file pins what moment produces;
 * this one puts the façade next to it and records every place the two differ.
 *
 * The goal is NOT zero deltas. Some are unavoidable (Intl and moment disagree
 * on small punctuation) and some are genuine improvements (moment falls back to
 * a coarser locale than the user actually chose). The goal is that every delta
 * is *known and deliberate* rather than discovered by a user.
 *
 * Read the snapshot as a to-do list for the migration: each entry is a string
 * that will change on screen when the corresponding call sites are converted.
 *
 * Keyed by APP locale (38) rather than moment locale (34), because the app
 * locale is what the façade receives. Several app locales share one moment
 * locale, and two of those pairs diverge — which is exactly the sort of thing
 * this file exists to surface.
 */
import moment from 'moment-timezone';
import { SupportedLocale } from 'typings';

import { appLocalesMomentPairs } from 'containers/App/constants';

import {
  setTenantZone,
  formatLongDate,
  formatShortDate,
  formatTime,
  formatDateTime,
  formatMonth,
  formatMonthShort,
  formatWeekday,
  formatTimeZoneAbbreviation,
  formatUtcOffset,
  toIsoDate,
} from '../dateFormat';
import patchMomentDeAtJanuary from '../patchMomentDeAtJanuary';

const TENANT_ZONE = 'Europe/Brussels';
const INSTANT = '2026-03-22T14:30:00Z';
const JANUARY = '2026-01-05T14:30:00Z';

const APP_LOCALES = Object.keys(appLocalesMomentPairs) as SupportedLocale[];

/**
 * Each façade function paired with the moment format token it replaces, so the
 * two can be run over the same instant and diffed.
 */
const CASES = [
  { name: 'isoDate', moment: 'YYYY-MM-DD', facade: (v, _l) => toIsoDate(v) },
  { name: 'shortDate', moment: 'L', facade: formatShortDate },
  { name: 'longDate', moment: 'LL', facade: formatLongDate },
  { name: 'dateTime', moment: 'LLL', facade: formatDateTime },
  { name: 'time', moment: 'LT', facade: formatTime },
  { name: 'month', moment: 'MMMM', facade: formatMonth },
  { name: 'monthShort', moment: 'MMM', facade: formatMonthShort },
  { name: 'weekday', moment: 'dddd', facade: formatWeekday },
  { name: 'tzAbbrev', moment: 'z', facade: formatTimeZoneAbbreviation },
  { name: 'utcOffset', moment: 'Z', facade: (v, _l) => formatUtcOffset(v) },
] satisfies ReadonlyArray<{
  name: string;
  moment: string;
  facade: (value: string, locale: SupportedLocale) => string;
}>;

/** Only the differing cases, so the snapshot is a delta list and not a dump. */
const diffFor = (instant: string) => {
  const deltas: Record<
    string,
    Record<string, { moment: string; facade: string }>
  > = {};

  APP_LOCALES.forEach((appLocale) => {
    const momentLocale = appLocalesMomentPairs[appLocale];

    CASES.forEach(({ name, moment: token, facade }) => {
      const fromMoment = moment_(instant).locale(momentLocale).format(token);
      const fromFacade = facade(instant, appLocale);

      if (fromMoment !== fromFacade) {
        deltas[appLocale] ??= {};
        deltas[appLocale][name] = { moment: fromMoment, facade: fromFacade };
      }
    });
  });

  return deltas;
};

// Aliased so the `moment` key inside CASES doesn't shadow the import.
const moment_ = moment;

beforeAll(() => {
  [...new Set(Object.values(appLocalesMomentPairs))].forEach((locale) => {
    require(`moment/locale/${locale}`);
  });
  patchMomentDeAtJanuary();
  moment.locale('en');
  moment.tz.setDefault(TENANT_ZONE);
  setTenantZone(TENANT_ZONE);
});

afterAll(() => {
  moment.tz.setDefault();
});

describe('moment vs façade', () => {
  // moment localizes digits for these two, so `.format('YYYY-MM-DD')` yields
  // Arabic-Indic / Gurmukhi numerals. That string is not a machine format any
  // more: getDateFilter in GraphCards/_utils/query.ts puts it straight into
  // analytics API params. The façade always emits ASCII, so converting these
  // call sites is a bug fix, not a regression.
  const LOCALES_MOMENT_LOCALIZES_DIGITS: SupportedLocale[] = ['ar-SA', 'pa-IN'];

  it('machine format is always ASCII, whatever the locale', () => {
    // The invariant that actually matters for the 73 `YYYY-MM-DD` call sites:
    // these strings go to the API and into query keys.
    APP_LOCALES.forEach(() => {
      expect(toIsoDate(INSTANT)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('machine format matches moment everywhere moment is not already broken', () => {
    APP_LOCALES.filter(
      (locale) => !LOCALES_MOMENT_LOCALIZES_DIGITS.includes(locale)
    ).forEach((appLocale) => {
      const fromMoment = moment(INSTANT)
        .locale(appLocalesMomentPairs[appLocale])
        .format('YYYY-MM-DD');
      expect(toIsoDate(INSTANT)).toBe(fromMoment);
    });
  });

  it('documents the two locales where moment emits non-ASCII digits', () => {
    // Pinned so that if moment's behaviour ever changes, or a third locale
    // joins them, this fails and the list above gets revisited.
    const broken = APP_LOCALES.filter(
      (appLocale) =>
        !/^\d{4}-\d{2}-\d{2}$/.test(
          moment(INSTANT)
            .locale(appLocalesMomentPairs[appLocale])
            .format('YYYY-MM-DD')
        )
    );
    expect(broken).toEqual(LOCALES_MOMENT_LOCALIZES_DIGITS);
  });

  it('deltas on an ordinary date', () => {
    expect(diffFor(INSTANT)).toMatchSnapshot();
  });

  it('deltas in January (de-AT override)', () => {
    expect(diffFor(JANUARY)).toMatchSnapshot();
  });
});
