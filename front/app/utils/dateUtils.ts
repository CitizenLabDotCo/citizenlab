import { TZDate } from '@date-fns/tz';
import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  format,
  startOfDay,
} from 'date-fns';
import { isString } from 'lodash-es';
// moment-timezone extends the regular moment library,
// so there's no need to import both moment and moment-timezone
import moment, { Moment } from 'moment-timezone';
import { SupportedLocale } from 'typings';

import { IEventData } from 'api/events/types';

import { IResolution } from 'components/admin/ResolutionControl';

import {
  formatDateTime,
  formatLongDate,
  formatTime,
  formatTimeZoneAbbreviation,
  getViewerZone,
  parseInZone,
  toIsoDate,
} from './dateFormat';

export function getIsoDateForToday(): string {
  // this is based on the user's timezone in moment, so
  // will return based on the current day of the user's browser
  return moment().format('YYYY-MM-DD');
}

// type required for timeAgo function
type RelativeTimeFormatUnit =
  | 'year'
  | 'years'
  | 'quarter'
  | 'quarters'
  | 'month'
  | 'months'
  | 'week'
  | 'weeks'
  | 'day'
  | 'days'
  | 'hour'
  | 'hours'
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds';

/**
 * Calculates and formats a human-readable relative time string (e.g., "2 days ago", "in 3 hours")
 * based on the difference between the provided date and the current time.
 *
 * The function determines the most appropriate time unit (years, months, weeks, days, hours,
 * minutes, or seconds) based on the elapsed time, and formats the result according to the
 * specified locale using the Intl.RelativeTimeFormat API for internationalization.
 *
 * Special care is taken to handle the transition between months and years appropriately,
 * converting values like "12 months" to "1 year" for more natural human readability.
 *
 * @param dateInput - Timestamp in milliseconds (from Date.getTime()) to calculate time from
 * @param locale - Language locale code (e.g., 'en', 'fr-BE') for formatting the output string
 * @returns A localized string representing the relative time, or undefined if calculation fails
 *
 * @example
 * // Returns "2 days ago" (in English)
 * timeAgo(Date.now() - 2 * 24 * 60 * 60 * 1000, 'en')
 *
 * @example
 * // Returns "il y a 1 an" (in French/Belgium)
 * timeAgo(Date.now() - 365 * 24 * 60 * 60 * 1000, 'fr-BE')
 *
 * Adapted from: Stas Parshin https://jsfiddle.net/tv9701uf
 */
export function timeAgo(dateInput: number, locale: SupportedLocale) {
  const inputDate = new Date(dateInput);
  const formatter = new Intl.RelativeTimeFormat(locale);

  /**
   * Determines the number of days in a given year (accounting for leap years)
   */
  const getDaysInYear = (year: number): number => {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeapYear ? 366 : 365;
  };

  /**
   * Determines the number of days in a specific month of a given year
   */
  const getDaysInMonth = (year: number, month: number): number => {
    // The 0 day of the next month is the last day of the current month
    return new Date(year, month + 1, 0).getDate();
  };

  /**
   * Time units in seconds for calculating relative time differences
   * Some units (years, months) are dynamic based on the specific date
   */
  const timeUnits = {
    // Dynamic units that depend on the specific date
    years: (year: number) => 3600 * 24 * getDaysInYear(year),
    months: (year: number, month: number) =>
      3600 * 24 * getDaysInMonth(year, month),

    // Static units
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };

  // Calculate seconds elapsed (negative for past, positive for future)
  const secondsElapsed = (inputDate.getTime() - Date.now()) / 1000;
  const absoluteSecondsElapsed = Math.abs(secondsElapsed);

  // Iterate through time units from largest (years) to smallest (seconds)
  for (const unit in timeUnits) {
    // Calculate the value for the current time unit
    let unitInSeconds: number;

    if (unit === 'years') {
      unitInSeconds = timeUnits['years'](inputDate.getFullYear());
    } else if (unit === 'months') {
      unitInSeconds = timeUnits['months'](
        inputDate.getFullYear(),
        inputDate.getMonth()
      );
    } else {
      unitInSeconds = timeUnits[unit];
    }

    // If the time difference is greater than the current unit threshold
    if (unitInSeconds <= absoluteSecondsElapsed) {
      // Calculate how many of this unit has elapsed
      const unitCount = secondsElapsed / unitInSeconds;

      // Special handling for months-to-years conversion
      if (unit === 'months') {
        const absoluteMonthCount = Math.abs(unitCount);
        const approximateYearCount = Math.round(absoluteMonthCount / 12);

        // Check if we're close to a full year or multiple years (within half a month)
        // This improves readability by converting values like "12 months ago" to "1 year ago"
        // The 0.5 threshold ensures values between 11.5-12.5 months are shown as "1 year"
        const isCloseToFullYear =
          approximateYearCount >= 1 &&
          Math.abs(absoluteMonthCount - approximateYearCount * 12) <= 0.5;

        if (isCloseToFullYear) {
          // Use singular 'year' for 1, plural 'years' for others
          const yearUnit = approximateYearCount === 1 ? 'year' : 'years';

          // Preserve original sign (negative for past, positive for future)
          const signPreservingYearCount =
            Math.sign(unitCount) * approximateYearCount;

          return formatter.format(signPreservingYearCount, yearUnit);
        }
      }

      // For all other cases, round to the nearest whole number and format
      const formattedUnit = unit as RelativeTimeFormatUnit;
      return formatter.format(Math.round(unitCount), formattedUnit);
    }
  }

  // If no appropriate time unit was found (should be rare)
  return undefined;
}

// Compares phase start/end timestamps against now at millisecond precision.
// Phase start_at/end_at are full ISO datetimes (timestamp without time zone
// on the backend, serialized with a Z offset), so day-granularity comparison
// would incorrectly treat a phase still as "present" between its end time
// and midnight.
type SingleDate = string;
type BeginAndEndDate = [string, string | null];
export function pastPresentOrFuture(input: SingleDate | BeginAndEndDate) {
  const now = moment();

  if (isString(input)) {
    const target = moment(input);
    if (now.isBefore(target)) return 'future';
    return now.isSame(target) ? 'present' : 'past';
  }

  const [startAt, endAt] = input;
  const start = moment(startAt);
  if (now.isBefore(start)) return 'future';
  if (endAt === null) return 'present';
  return now.isBefore(moment(endAt)) ? 'present' : 'past';
}

// this is used to display event start/end times, which are stored in UTC time
// on the backend (ex: "2022-06-02T21:46:00.000Z")
// so we respect the user's current timezone
export function getIsoDate(date: string) {
  // respects user's timezone
  return moment(new Date(date)).format('YYYY-MM-DD');
}

export function getIsoDateUtc(date: string) {
  // by using moment.utc, we ignore timezone offsets which could cause bugs
  return moment.utc(new Date(date)).format('YYYY-MM-DD');
}

export const momentToIsoDate = (moment: Moment | null | undefined) => {
  return moment?.format('yyyy-MM-DD');
};

type DiffUnit = 'days' | 'weeks' | 'months';

const DIFF_BY_UNIT = {
  days: differenceInDays,
  weeks: differenceInWeeks,
  months: differenceInMonths,
} as const;

export function getPeriodRemainingUntil(
  date: string,
  tenantTimezone: string,
  timeUnit: DiffUnit
): number {
  // Target date and "today at midnight", both read in the tenant's timezone.
  const targetDate = parseInZone(date, tenantTimezone);
  const now = startOfDay(new TZDate(Date.now(), tenantTimezone));

  return DIFF_BY_UNIT[timeUnit](targetDate, now);
}

export function convertSecondsToDDHHMM(seconds: number) {
  const daysLeft = Math.floor(seconds / (3600 * 24));
  const formattedDaysLeft = daysLeft < 10 ? `0${daysLeft}` : daysLeft;
  const hoursLeft = Math.floor((seconds % (3600 * 24)) / 3600);
  const formattedHoursLeft = hoursLeft < 10 ? `0${hoursLeft}` : hoursLeft;
  const minutesLeft = Math.floor((seconds % 3600) / 60);
  const formattedMinutesLeft =
    minutesLeft < 10 ? `0${minutesLeft}` : minutesLeft;
  return `${formattedDaysLeft}:${formattedHoursLeft}:${formattedMinutesLeft}`;
}

export function toThreeLetterMonth(date: string, resolution: IResolution) {
  return moment
    .utc(date, 'YYYY-MM-DD')
    .format(resolution === 'month' ? 'MMM' : 'DD MMM');
}

export function toFullMonth(date: string, resolution: IResolution) {
  if (resolution === 'week') {
    const startWeek = moment.utc(date, 'YYYY-MM-DD');
    const endWeek = startWeek.clone().add({ day: 7 });

    const sameYear = startWeek.year() === endWeek.year();
    if (!sameYear) {
      return `${startWeek.format('MMMM DD, YYYY')} - ${endWeek.format(
        'MMMM DD, YYYY'
      )}`;
    }

    const sameMonth = startWeek.month() === endWeek.month();
    if (!sameMonth) {
      return `${startWeek.format('MMMM DD')} - ${endWeek.format(
        'MMMM DD, YYYY'
      )}`;
    }

    return `${startWeek.format('MMMM DD')} - ${endWeek.format('DD, YYYY')}`;
  }

  return moment
    .utc(date, 'YYYY-MM-DD')
    .format(resolution === 'month' ? 'MMMM YYYY' : 'MMMM DD, YYYY');
}

// Function used to determine whether a dot should be shown after the day in short date formats
// as this is can't be determined for a 3-day month by the moment.js library.
// Currently only used for German. Other locales can be added if needed.
export function showDotAfterDay(locale: SupportedLocale) {
  return locale === 'de-DE';
}

// Function used to get the event dates in a localized string format,
// converted to the viewer's local timezone with a timezone label.
export function getEventDateString(event: IEventData, locale: SupportedLocale) {
  const { start_at, end_at } = event.attributes;
  // Event times are shown in the VIEWER's timezone, not the tenant's, so that
  // an attendee always reads the time on their own clock. The label makes the
  // zone explicit.
  const inViewerZone = { timeZone: getViewerZone() };
  const tzLabel = formatTimeZoneAbbreviation(start_at, locale, inViewerZone);

  const isEventMultipleDays =
    toIsoDate(start_at, inViewerZone) !== toIsoDate(end_at, inViewerZone);

  if (isEventMultipleDays) {
    return `${formatDateTime(
      start_at,
      locale,
      inViewerZone
    )} - ${formatDateTime(end_at, locale, inViewerZone)} ${tzLabel}`;
  }

  return `${formatLongDate(start_at, locale, inViewerZone)} • ${formatTime(
    start_at,
    locale,
    inViewerZone
  )} - ${formatTime(end_at, locale, inViewerZone)} ${tzLabel}`;
}

// Get a single date in local format - for example for voting phase end date
export function getLocalisedDateString(dateString: string | null | undefined) {
  return dateString && moment(dateString, 'YYYY-MM-DD').format('LL');
}

export const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Why do we need this function?
// The backend sends dates in the format "YYYY-MM-DD" without a time component.
// When we parse this date in the frontend, it is interpreted as
// midnight in UTC.
// This means that if we are west of UTC, e.g. in Brazil,
// The date will be interpreted as 21:00 the previous day.
// This function makes sure that the date is always interpreted as midnight in the user's timezone.
const backendDatestringRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function parseBackendDateString(_dateString: string) {
  let dateString = _dateString;

  // Sometimes, e.g. in the craftjson layouts,
  // we still have old reports using datestrings like
  // 2023-01-13T14:54:51.5151
  // This was an implementation bug- we should have used
  // the yyyy-MM-DD from the start.
  // But for now, we need to handle this case.
  // TODO: fix this properly in a migration.
  if (dateString.length > 10) {
    dateString = dateString.slice(0, 10);
  }

  if (!dateString.match(backendDatestringRegex)) {
    throw new Error('Invalid date string');
  }

  const day = dateString.split('-').map(Number)[2];
  const date = new Date(dateString);

  const parsedDay = date.getDate();

  if (day === parsedDay) {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(24, 0, 0, 0);
  }

  return date;
}

export const toBackendDateString = (date?: Date) => {
  if (!date) return undefined;
  const monthNumber = date.getMonth() + 1;
  const dayNumber = date.getDate();

  const month = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
  const day = dayNumber < 10 ? `0${dayNumber}` : dayNumber;

  return `${date.getFullYear()}-${month}-${day}`;
};

// Calculate GMT offset based on selected date (or current date if none selected) - DST safe
export const getGmtOffset = (
  timeZone: string | undefined,
  tenantTimeNow: Date,
  selectedDate?: Date
) => {
  if (!timeZone) return '';

  const dateToCheck = selectedDate || tenantTimeNow;
  // Midnight on that calendar day in the target zone, so the offset reflects
  // whether DST is in effect on the selected date rather than right now.
  const midnightThere = new TZDate(
    dateToCheck.getFullYear(),
    dateToCheck.getMonth(),
    dateToCheck.getDate(),
    timeZone
  );

  return format(midnightThere, 'xxx');
};

export const convertToTimeZoneISO = (
  date: Date | undefined,
  timeZone?: string
): string => {
  if (!date || !timeZone) return '';

  // The Date carries wall-clock components the user picked; re-read them in
  // the target zone to get the instant they actually meant.
  const instant = new TZDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    timeZone
  );

  return new Date(instant.getTime()).toISOString();
};
/**
 * "Now", as a Date whose local components read as the wall clock in `timeZone`.
 *
 * The scheduling screens all need this: their date/time pickers work in plain
 * local Dates, but the value the user is choosing is a tenant-timezone wall
 * clock. Falls back to the viewer's own clock when no zone is configured.
 */
export const nowInZone = (timeZone?: string): Date => {
  const now = new Date();
  if (!timeZone) return now;
  return getDateInTimezone(now.toISOString(), timeZone) ?? now;
};

export const getDateInTimezone = (
  isoString: string | null | undefined,
  timeZone: string | undefined
): Date | undefined => {
  if (!isoString || !timeZone) return undefined;

  const inZone = parseInZone(isoString, timeZone);
  // Deliberately rebuilt as a local Date from the zone's wall-clock parts —
  // callers want a Date whose components read as they do in `timeZone`.
  return new Date(
    inZone.getFullYear(),
    inZone.getMonth(),
    inZone.getDate(),
    inZone.getHours(),
    inZone.getMinutes(),
    inZone.getSeconds()
  );
};
