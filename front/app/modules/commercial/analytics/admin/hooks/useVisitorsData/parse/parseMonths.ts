import moment, { Moment } from 'moment';
import {
  indexTimeSeries,
  getFirstDateInData,
  getLastDateInData,
  getEmptyRow,
  dateRange,
} from './utils';
import { TimeSeriesResponse } from '../typings';

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
    const currentMonthISO = month.toISOString();
    const row = indexedTimeSeries.get(currentMonthISO);

    return row ?? getEmptyRow(month);
  });
};

const roundDownToFirstDayOfMonth = (date: Moment) => {
  return moment(`${date.format('YYYY-MM')}-01`);
};
