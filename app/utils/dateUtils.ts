import moment from 'moment';
import { isString } from 'lodash-es';

export function pastPresentOrFuture(input: string | [string, string]) {
  if (isString(input)) {
    const isoDate = getIsoDate(input);
    const currentIsoDate = moment().format('YYYY-MM-DD');

    if (isoDate === currentIsoDate) {
      return 'present';
    } else if (moment(currentIsoDate, 'YYYY-MM-DD').isAfter(isoDate)) {
      return 'past';
    }

    return 'future';
  } else {
    const startIsoDate = getIsoDate(input[0]);
    const endIsoDate = getIsoDate(input[1]);
    const currentIsoDate = moment().format('YYYY-MM-DD');

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
}

export function getIsoDate(date: string) {
  return moment(new Date(date)).format('YYYY-MM-DD');
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
