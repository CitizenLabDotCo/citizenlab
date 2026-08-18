/**
 * Date formatting façade — the single place the app turns an instant into a
 * string. Everything date-fns / Intl lives behind this module so that the rest
 * of the app never imports a date library directly.
 *
 * Two reasons that matters:
 *
 *  1. It replaces moment's two hidden globals (`moment.tz.setDefault` and
 *     `moment.locale`) with something greppable and testable.
 *  2. When native `Temporal` becomes usable (Safari is the current blocker),
 *     swapping the engine is a change to this file rather than a repeat of the
 *     118-file moment migration.
 *
 * Timezone is module state; locale deliberately is not — see below.
 */
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { SupportedLocale } from 'typings';

/** Anything we accept as an instant: ISO string, Date, or epoch milliseconds. */
export type DateInput = string | Date | number;

const toDate = (value: DateInput): Date =>
  value instanceof Date ? value : new Date(value);

/**
 * Options accepted by every formatter.
 *
 * `timeZone` overrides the tenant zone for the rare cases that genuinely need
 * a different one — event times are rendered in the *viewer's* zone, and the
 * admin scheduling screens format a zone the user picked from a dropdown.
 * Omit it and you get the tenant zone, which is what almost every call wants.
 */
export type FormatOptions = { timeZone?: string };

/* ────────────────────────────── tenant timezone ─────────────────────────────
 * The tenant's timezone is app configuration: read once from appConfiguration
 * at startup and constant for the rest of the session. That is why a module
 * -level value is safe here — it cannot change mid-render, so no component can
 * observe a stale one. This replaces `moment.tz.setDefault()`.
 * ────────────────────────────────────────────────────────────────────────── */

let tenantZone: string | undefined;

export const setTenantZone = (timeZone: string): void => {
  tenantZone = timeZone;
};

/** Falls back to the viewer's own zone until the tenant config has loaded. */
export const getTenantZone = (): string =>
  tenantZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Parse a date string the way `moment.tz(value, zone)` did.
 *
 * The distinction matters and is easy to get wrong: a string carrying an
 * offset ("…Z", "…+02:00") names an *instant*, but one without ("2026-03-22",
 * "2026-03-22T14:30:00") is a *wall-clock* reading in the given zone. Passing
 * an offset-less string straight to `new TZDate()` treats it as UTC, which
 * silently shifts the date by a day for anyone west of UTC.
 */
const HAS_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/;

export const parseInZone = (value: string, timeZone: string): TZDate => {
  if (HAS_OFFSET.test(value)) return new TZDate(new Date(value), timeZone);

  const [datePart, timePart = ''] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = timePart
    ? timePart.split(':').map(Number)
    : [];

  return new TZDate(
    year,
    month - 1,
    day,
    hours,
    minutes,
    Math.floor(seconds),
    timeZone
  );
};

/* ─────────────────────────── machine formats ────────────────────────────────
 * Locale-independent by definition: these strings go to the API, into query
 * keys and into sort comparisons, so they must be byte-identical in every
 * language. Never render them to a user.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * `2026-03-22` in the tenant's timezone.
 *
 * Note the lowercase pattern: in date-fns `YYYY` is the week-numbering year and
 * `DD` is the day of the year, so moment's `YYYY-MM-DD` is a bug here. date-fns
 * throws a RangeError on those tokens rather than failing quietly.
 */
export const toIsoDate = (value: DateInput, options?: FormatOptions): string =>
  format(
    new TZDate(toDate(value), options?.timeZone ?? getTenantZone()),
    'yyyy-MM-dd'
  );

/** Four-digit calendar year — moment `YYYY`. Locale-independent. */
export const formatYear = (value: DateInput, options?: FormatOptions): string =>
  format(
    new TZDate(toDate(value), options?.timeZone ?? getTenantZone()),
    'yyyy'
  );

/* ────────────────────────── localized display formats ───────────────────────
 * Locale is always an explicit argument. There is deliberately no module-level
 * locale, even though that would mirror `moment.locale()` more closely:
 * the locale changes at runtime when a user switches language, and a module
 * variable assigned from a useEffect would be one render stale — the app would
 * paint dates in the previous language for a frame, with nothing to trigger a
 * correction.
 *
 * Components read the locale with `useLocale()` and pass it in, the same way
 * non-component helpers take it from their caller. A hook that pre-bound the
 * locale was tried and removed: it could not express the `timeZone` override
 * the event components need, and one calling convention beats two.
 *
 * These use `Intl` rather than date-fns `format` with `P`-style tokens, so
 * they need no locale registry and cannot be affected by module load order.
 * ────────────────────────────────────────────────────────────────────────── */

const dtf = (
  locale: SupportedLocale,
  options: Intl.DateTimeFormatOptions,
  { timeZone }: FormatOptions = {}
) =>
  new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: timeZone ?? getTenantZone(),
  });

/** The viewer's own timezone, as resolved by the browser. */
export const getViewerZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Long date — moment `LL`. "22 March 2026" / "22 mars 2026". */
export const formatLongDate = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string => dtf(locale, { dateStyle: 'long' }, options).format(toDate(value));

/**
 * Numeric date — moment `L`. "22/03/2026" in en-GB, "03/22/2026" in en-US.
 *
 * Spelled out as explicit 2-digit fields rather than `dateStyle: 'short'`,
 * which drops the padding and shortens the year ("3/22/26").
 */
export const formatShortDate = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string =>
  dtf(
    locale,
    { day: '2-digit', month: '2-digit', year: 'numeric' },
    options
  ).format(toDate(value));

/** Time of day — moment `LT`. "14:30" / "2:30 PM". */
export const formatTime = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string => dtf(locale, { timeStyle: 'short' }, options).format(toDate(value));

/**
 * Long date and time — moment `LLL`.
 *
 * Composed from the two parts rather than asking Intl for
 * `{ dateStyle, timeStyle }` together, because the combined form inserts a
 * connector word — "at", "à", "um", "في" — that moment does not produce. Left
 * as the combined form this alone changed the rendered string in 30 of our 38
 * locales.
 */
export const formatDateTime = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string =>
  `${formatLongDate(value, locale, options)} ${formatTime(
    value,
    locale,
    options
  )}`;

/** Standalone month name — moment `MMMM`. */
export const formatMonth = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string => dtf(locale, { month: 'long' }, options).format(toDate(value));

/** Abbreviated month name — moment `MMM`. */
export const formatMonthShort = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string => dtf(locale, { month: 'short' }, options).format(toDate(value));

/** Day of the month, zero-padded — moment `DD`. */
export const formatDayOfMonth = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string => dtf(locale, { day: '2-digit' }, options).format(toDate(value));

/**
 * Whether two instants fall on the same calendar day in a given zone.
 *
 * Replaces the `dayOfYear()` comparisons moment made. Note this also compares
 * the year, which the moment version did not — an event exactly one year long
 * used to count as a single day.
 */
export const isSameDayInZone = (
  a: DateInput,
  b: DateInput,
  timeZone?: string
): boolean => toIsoDate(a, { timeZone }) === toIsoDate(b, { timeZone });

/** Weekday name — moment `dddd`. */
export const formatWeekday = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string => dtf(locale, { weekday: 'long' }, options).format(toDate(value));

/**
 * Timezone label — moment `z`.
 *
 * moment-timezone rendered tz-database abbreviations ("CET"); Intl cannot, and
 * gives an offset form instead ("GMT+1"). That difference was reviewed and
 * accepted — it is unambiguous and avoids maintaining an abbreviation lookup
 * table. Don't add one back. See dateFormat.README.md.
 */
export const formatTimeZoneAbbreviation = (
  value: DateInput,
  locale: SupportedLocale,
  options?: FormatOptions
): string => {
  const parts = dtf(locale, { timeZoneName: 'short' }, options).formatToParts(
    toDate(value)
  );
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
};

/** UTC offset — moment `Z`. "+01:00". */
export const formatUtcOffset = (
  value: DateInput,
  options?: FormatOptions
): string =>
  format(
    new TZDate(toDate(value), options?.timeZone ?? getTenantZone()),
    'xxx'
  );
