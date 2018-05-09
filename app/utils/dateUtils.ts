import * as moment from 'moment';
import { isString } from 'lodash';

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
  
    if (moment(currentIsoDate).isBetween(startIsoDate, endIsoDate, 'days', '[]')) {
      return 'present';
    } else if (moment(currentIsoDate).isAfter(endIsoDate)) {
      return 'past';
    }
  
    return 'future';
  }
}

export function getIsoDate(date:string) {
  return moment(date).format('YYYY-MM-DD');
}
