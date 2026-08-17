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
export const toIsoDate = (value: DateInput): string =>
  format(new TZDate(toDate(value), getTenantZone()), 'yyyy-MM-dd');

/** `2026-03` in the tenant's timezone. */
export const toIsoMonth = (value: DateInput): string =>
  format(new TZDate(toDate(value), getTenantZone()), 'yyyy-MM');

/* ────────────────────────── localized display formats ───────────────────────
 * Locale is always an explicit argument. There is deliberately no module-level
 * locale, even though that would mirror `moment.locale()` more closely:
 * the locale changes at runtime when a user switches language, and a module
 * variable assigned from a useEffect would be one render stale — the app would
 * paint dates in the previous language for a frame, with nothing to trigger a
 * correction.
 *
 * Components should use `useFormatDate()`, which binds these to the active
 * locale. Non-component helpers take the locale as a parameter from whoever
 * called them.
 *
 * These use `Intl` rather than date-fns `format` with `P`-style tokens, so
 * they need no locale registry and cannot be affected by module load order.
 * ────────────────────────────────────────────────────────────────────────── */

const dtf = (locale: SupportedLocale, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone: getTenantZone() });

/** Long date — moment `LL`. "22 March 2026" / "22 mars 2026". */
export const formatLongDate = (
  value: DateInput,
  locale: SupportedLocale
): string => dtf(locale, { dateStyle: 'long' }).format(toDate(value));

/**
 * Numeric date — moment `L`. "22/03/2026" in en-GB, "03/22/2026" in en-US.
 *
 * Spelled out as explicit 2-digit fields rather than `dateStyle: 'short'`,
 * which drops the padding and shortens the year ("3/22/26").
 */
export const formatShortDate = (
  value: DateInput,
  locale: SupportedLocale
): string =>
  dtf(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(toDate(value));

/** Time of day — moment `LT`. "14:30" / "2:30 PM". */
export const formatTime = (value: DateInput, locale: SupportedLocale): string =>
  dtf(locale, { timeStyle: 'short' }).format(toDate(value));

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
  locale: SupportedLocale
): string => `${formatLongDate(value, locale)} ${formatTime(value, locale)}`;

/** Standalone month name — moment `MMMM`. */
export const formatMonth = (
  value: DateInput,
  locale: SupportedLocale
): string => dtf(locale, { month: 'long' }).format(toDate(value));

/** Abbreviated month name — moment `MMM`. */
export const formatMonthShort = (
  value: DateInput,
  locale: SupportedLocale
): string => dtf(locale, { month: 'short' }).format(toDate(value));

/** Weekday name — moment `dddd`. */
export const formatWeekday = (
  value: DateInput,
  locale: SupportedLocale
): string => dtf(locale, { weekday: 'long' }).format(toDate(value));

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
  locale: SupportedLocale
): string => {
  const parts = dtf(locale, { timeZoneName: 'short' }).formatToParts(
    toDate(value)
  );
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
};

/** UTC offset — moment `Z`. "+01:00". */
export const formatUtcOffset = (value: DateInput): string =>
  format(new TZDate(toDate(value), getTenantZone()), 'xxx');
