import { Moment } from 'moment';
import {
  indexTimeSeries,
  getFirstDateInData,
  getLastDateInData,
  getEmptyRow,
} from './utils';
import { TimeSeriesResponse, TimeSeries } from '../typings';

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

  let currentMonday = startMonday.clone();

  const weeks: TimeSeries = [];

  // Should not be possible, but just in case to avoid
  // infinite loop
  if (currentMonday.isAfter(endMonday)) return null;

  while (currentMonday.isSameOrBefore(endMonday)) {
    const currentMondayISO = currentMonday.toISOString();
    const week = indexedTimeSeries.get(currentMondayISO);

    if (week) {
      weeks.push(week);
    } else {
      weeks.push(getEmptyRow(currentMonday));
    }

    currentMonday = currentMonday.add({ day: 7 });
  }

  return weeks;
};

const roundDownToMonday = (date: Moment) => {
  const dayNumber = date.isoWeekday();
  return date.clone().subtract({ day: dayNumber - 1 });
};
