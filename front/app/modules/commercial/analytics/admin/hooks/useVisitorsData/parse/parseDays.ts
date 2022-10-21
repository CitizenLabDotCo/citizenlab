import { Moment } from 'moment';
import { TimeSeriesResponse } from '../typings';
import {
  dateRange,
  getEmptyRow,
  getFirstDateInData,
  getLastDateInData,
  indexTimeSeries,
} from './utils';

export const parseDays = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined
) => {
  const indexedTimeSeries = indexTimeSeries(responseTimeSeries);

  const firstDateInData = getFirstDateInData(responseTimeSeries);
  const lastDateInData = getLastDateInData(responseTimeSeries);

  const startDay = startAtMoment ?? firstDateInData;
  const endDay = endAtMoment ?? lastDateInData;

  const days = dateRange(startDay, endDay, 'day');
  if (days === null) return null;

  return days.map((day) => {
    const currentDayStr = day.format('YYYY-MM-DD');
    const row = indexedTimeSeries.get(currentDayStr);

    return row ?? getEmptyRow(day);
  });
};
