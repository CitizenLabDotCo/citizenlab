import moment from 'moment';

import { AgeSerie } from 'containers/Admin/dashboard/users/Charts/AgeChart/typings';
import { GenderSerie } from 'containers/Admin/dashboard/users/Charts/GenderChart/typings';

export const serieHasValues = (serie: GenderSerie | AgeSerie) => {
  let hasValues = false;
  serie.map((element) => {
    if (element.value > 0) {
      hasValues = true;
    }
  });
  return hasValues;
};

const round = (n: number) => Math.round(n * 10) / 10;

export const formatLargeNumber = (value: number) => {
  if (value >= 1000000) {
    return `${round(value / 1000000)}M`;
  } else if (value >= 1000) {
    return `${round(value / 1000)}K`;
  } else {
    return value.toString();
  }
};

export const getDaysInRange = (
  startAt?: string | null,
  endAt?: string | null
) => {
  if (!(startAt && endAt)) return undefined;
  return moment(endAt).diff(moment(startAt), 'days');
};

export const toPercentage = (value: number | undefined) => {
  if (value === undefined) return 0;
  return Math.round(Math.min(value, 1) * 100);
};
