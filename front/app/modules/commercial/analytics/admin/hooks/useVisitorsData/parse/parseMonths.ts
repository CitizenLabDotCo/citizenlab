import moment, { Moment } from 'moment';
import { TimeSeriesResponse } from '../typings';
import {
  dateRange,
  getEmptyRow,
  getFirstDateInData,
  getLastDateInData,
  indexTimeSeries,
} from './utils';

export const parseMonths = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined
) => {
  const indexedTimeSeries = indexTimeSeries(responseTimeSeries);

  const firstDateInData = getFirstDateInData(responseTimeSeries);
  const lastDateInData = getLastDateInData(responseTimeSeries);

  const startMonth = startAtMoment
    ? roundDownToFirstDayOfMonth(startAtMoment)
    : roundDownToFirstDayOfMonth(firstDateInData);

  const endMonth = endAtMoment
    ? roundDownToFirstDayOfMonth(endAtMoment)
    : roundDownToFirstDayOfMonth(lastDateInData);

  const months = dateRange(startMonth, endMonth, 'month');
  if (months === null) return null;

  return months.map((month) => {
    const currentMonthStr = month.format('YYYY-MM-DD');
    const row = indexedTimeSeries.get(currentMonthStr);

    return row ?? getEmptyRow(month);
  });
};

const roundDownToFirstDayOfMonth = (date: Moment) => {
  return moment(`${date.format('YYYY-MM')}-01`);
};
