import { GenderSerie } from 'containers/Admin/dashboard/users/Charts/GenderChart/typings';
import { AgeSerie } from 'containers/Admin/dashboard/users/Charts/AgeChart/typings';

export const serieHasValues = (serie: GenderSerie | AgeSerie) => {
  let hasValues = false;
  serie.map((element) => {
    if (element.value > 0) {
      hasValues = true;
    }
  });
  return hasValues;
};

export const formatLargeNumber = (value: number) => {
  if (value >= 1000000) {
    return `${value / 1000000}M`;
  } else if (value >= 1000) {
    return `${value / 1000}K`;
  } else {
    return value.toString();
  }
};
