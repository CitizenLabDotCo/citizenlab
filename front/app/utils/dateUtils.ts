import moment, { unitOfTime } from 'moment';
import { isString } from 'lodash-es';
import { Locale } from 'typings';
import { IResolution } from 'components/admin/ResolutionControl';
import { IEventData } from 'api/events/types';

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

// this function returns a string representing "time since" the input date in the appropriate format.
// Relative Time Format is used for internationalization.
// Adapted from: Stas Parshin https://jsfiddle.net/tv9701uf
export function timeAgo(dateInput: number, locale: Locale) {
  const date = new Date(dateInput);
  const formatter = new Intl.RelativeTimeFormat(locale);

  const getDaysInYear = (year: number) => {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return 366; // Leap year
    } else {
      return 365; // Non-leap year
    }
  };
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const ranges = {
    years: (year: number) => 3600 * 24 * getDaysInYear(year),
    months: (year: number, month: number) =>
      3600 * 24 * getDaysInMonth(year, month),
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };

  const secondsElapsed = (date.getTime() - Date.now()) / 1000;

  for (const key in ranges) {
    let value: number;

    if (key === 'years') {
      value = ranges['years'](date.getFullYear());
    } else if (key === 'months') {
      value = ranges['months'](date.getFullYear(), date.getMonth());
    } else {
      value = ranges[key];
    }

    if (value <= Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / value;
      return formatter.format(Math.round(delta), key as RelativeTimeFormatUnit);
    }
  }

  return undefined;
}

// this function is exclusively used to compare phase start/ends,
// which are created and stored with the YYYY-MM-DD format (no time of day)
type SingleDate = string;
type BeginAndEndDate = [string, string | null];
export function pastPresentOrFuture(input: SingleDate | BeginAndEndDate) {
  const currentIsoDate = getIsoDateForToday();
  const momentCurrentDate = moment(currentIsoDate, 'YYYY-MM-DD');

  // if input is a string representing one date
  if (isString(input)) {
    const isoDate = getIsoDateUtc(input);

    if (isoDate === currentIsoDate) {
      return 'present';
    } else if (momentCurrentDate.isAfter(isoDate)) {
      return 'past';
    }

    return 'future';
  }

  // if input is an array with start and end dates
  const startIsoDate = getIsoDateUtc(input[0]);

  if (input[1] === null) {
    const isPresent =
      momentCurrentDate.isAfter(startIsoDate) ||
      momentCurrentDate.isSame(startIsoDate);
    return isPresent ? 'present' : 'future';
  }
  const endIsoDate = getIsoDateUtc(input[1]);

  if (momentCurrentDate.isBetween(startIsoDate, endIsoDate, 'days', '[]')) {
    return 'present';
  } else if (momentCurrentDate.isAfter(endIsoDate)) {
    return 'past';
  }

  return 'future';
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

export function getPeriodRemainingUntil(
  date: string,
  timeUnit: unitOfTime.Diff = 'days'
): number {
  return moment(new Date(date)).diff(moment({ hours: 0 }), timeUnit);
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
export function showDotAfterDay(locale: Locale) {
  return locale === 'de-DE';
}

// Function used to get the event dates in a localized string format
export function getEventDateString(event: IEventData) {
  const startMoment = moment(event.attributes.start_at);
  const endMoment = moment(event.attributes.end_at);

  const isEventMultipleDays =
    startMoment.dayOfYear() !== endMoment.dayOfYear() ||
    startMoment.year() !== endMoment.year(); // Added in case the event is exactly 1 year long

  if (isEventMultipleDays) {
    return `${startMoment.format('LLL')} - ${endMoment.format('LLL')}`;
  } else {
    return `${startMoment.format('LL')} • ${startMoment.format(
      'LT'
    )} - ${endMoment.format('LT')}`;
  }
}

// Get a single date in local format - for example for voting phase end date
export function getLocalisedDateString(dateString: string | null | undefined) {
  return dateString && moment(dateString, 'YYYY-MM-DD').format('LL');
}

export function roundToNearestMultipleOfFive(date: Date): Date {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 5) * 5;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    roundedMinutes
  );
}

export function calculateRoundedEndDate(
  startDate: Date,
  durationInMinutes = 30
): Date {
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + durationInMinutes);
  return endDate;
}
