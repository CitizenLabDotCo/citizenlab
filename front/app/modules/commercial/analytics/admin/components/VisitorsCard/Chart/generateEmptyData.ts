import moment from 'moment';

// utils
import { range } from 'lodash-es';

// typings
import {
  TimeSeries,
  TimeSeriesRow,
} from '../../../hooks/useVisitorsData/typings';

export const generateEmptyData = (): TimeSeries => {
  return range(-6, 1).map((i) => {
    const firstDayOfMonth = moment()
      .subtract({ months: Math.abs(i) })
      .format('YYYY-MM-01');

    const row: TimeSeriesRow = {
      date: firstDayOfMonth,
      visitors: i === 0 ? 250 : 0,
      visits: i === 0 ? 250 : 0,
    };

    return row;
  });
};
