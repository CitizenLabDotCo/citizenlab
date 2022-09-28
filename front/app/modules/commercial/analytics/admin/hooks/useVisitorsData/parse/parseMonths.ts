import moment, { Moment } from 'moment';
import {
  indexTimeSeries,
  getFirstDateInData,
  getLastDateInData,
  getEmptyRow,
} from './utils';
import { TimeSeriesResponse, TimeSeries } from '../typings';

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

  let currentMonth = startMonth.clone();

  const months: TimeSeries = [];

  // Should not be possible, but just in case to avoid
  // infinite loop
  if (currentMonth.isAfter(endMonth)) return null;

  while (currentMonth.isSameOrBefore(endMonth)) {
    const currentMondayISO = currentMonth.toISOString();
    const month = indexedTimeSeries.get(currentMondayISO);

    if (month) {
      months.push(month);
    } else {
      months.push(getEmptyRow(currentMonth));
    }

    currentMonth = currentMonth.add({ month: 1 });
  }

  return months;
};

const roundDownToFirstDayOfMonth = (date: Moment) => {
  return moment(`${date.format('YYYY-MM')}-01`);
};
