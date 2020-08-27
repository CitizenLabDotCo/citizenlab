import moment from 'moment';
import { isString } from 'lodash-es';

export function pastPresentOrFuture(input: string | [string, string]) {
  if (isString(input)) {
    const isoDate = moment(input).format('YYYY-MM-DD');
    const currentIsoDate = moment().format('YYYY-MM-DD');

    if (isoDate === currentIsoDate) {
      return 'present';
    } else if (moment(currentIsoDate).isAfter(isoDate)) {
      return 'past';
    }

    return 'future';
  } else {
    const startIsoDate = moment(input[0]).format('YYYY-MM-DD');
    const endIsoDate = moment(input[1]).format('YYYY-MM-DD');
    const currentIsoDate = moment().format('YYYY-MM-DD');

    if (
      moment(currentIsoDate).isBetween(startIsoDate, endIsoDate, 'days', '[]')
    ) {
      return 'present';
    } else if (moment(currentIsoDate).isAfter(endIsoDate)) {
      return 'past';
    }

    return 'future';
  }
}

export function getIsoDate(date: string) {
  return moment(date).format('YYYY-MM-DD');
}

export function getDaysRemainingUntil(date: string): number {
  return moment(date).diff(moment({ hours: 0 }), 'days');
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
