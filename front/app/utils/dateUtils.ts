import moment from 'moment';
import { isString } from 'lodash-es';

export function getIsoDateForToday(): string {
  // this is based on the user's timezone in moment, so
  // will return based on the current day of the user's browser
  return moment().format('YYYY-MM-DD');
}

// this function is exclusively used to compare phase start/ends,
// which are created and stored with the YYYY-MM-DD format (no time of day)
export function pastPresentOrFuture(input: string | [string, string]) {
  const currentIsoDate = getIsoDateForToday();

  // if input is a string representing one date
  if (isString(input)) {
    const isoDate = getIsoDate(input);

    if (isoDate === currentIsoDate) {
      return 'present';
    } else if (moment(currentIsoDate, 'YYYY-MM-DD').isAfter(isoDate)) {
      return 'past';
    }

    return 'future';
  }

  // if input is an array with start and end dates
  const startIsoDate = getIsoDate(input[0]);
  const endIsoDate = getIsoDate(input[1]);

  if (
    moment(currentIsoDate, 'YYYY-MM-DD').isBetween(
      startIsoDate,
      endIsoDate,
      'days',
      '[]'
    )
  ) {
    return 'present';
  } else if (moment(currentIsoDate, 'YYYY-MM-DD').isAfter(endIsoDate)) {
    return 'past';
  }

  return 'future';
}

export function getIsoDate(date: string) {
  // by using moment.utc, we ignore timezone offsets which could cause bugs
  return moment.utc(new Date(date)).format('YYYY-MM-DD');
}

export function getDaysRemainingUntil(date: string): number {
  return moment(new Date(date)).diff(moment({ hours: 0 }), 'days');
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
