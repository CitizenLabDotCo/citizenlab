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
