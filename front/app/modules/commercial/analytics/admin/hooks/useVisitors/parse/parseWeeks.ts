import { Moment } from 'moment';
import {
  indexTimeSeries,
  getFirstDateInData,
  getLastDateInData,
  getEmptyRow,
  dateRange,
} from './utils';
import { TimeSeriesResponse } from '../typings';

export const parseWeeks = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined
) => {
  const indexedTimeSeries = indexTimeSeries(responseTimeSeries);

  const firstDateInData = getFirstDateInData(responseTimeSeries);
  const lastDateInData = getLastDateInData(responseTimeSeries);

  const startMonday = startAtMoment
    ? roundDownToMonday(startAtMoment)
    : roundDownToMonday(firstDateInData);

  const endMonday = endAtMoment
    ? roundDownToMonday(endAtMoment)
    : roundDownToMonday(lastDateInData);

  const mondays = dateRange(startMonday, endMonday, 'week');
  if (mondays === null) return null;

  return mondays.map((monday) => {
    const currentMondayStr = monday.format('YYYY-MM-DD');
    const row = indexedTimeSeries.get(currentMondayStr);

    return row ?? getEmptyRow(monday);
  });
};

const roundDownToMonday = (date: Moment) => {
  const dayNumber = date.isoWeekday();
  return date.clone().subtract({ day: dayNumber - 1 });
};
