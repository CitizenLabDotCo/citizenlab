import { Moment } from 'moment';
import { getFirstDateInData, getLastDateInData, getDate } from './utils';
// import { range } from 'lodash-es';
import { TimeSeriesResponse, TimeSeries, TimeSeriesRow, TimeSeriesResponseRow } from '../typings';

export const parseWeeks = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined
) => {
  const indexedTimeSeries = indexTimeSeries(responseTimeSeries);

  const firstDateInData = getFirstDateInData(responseTimeSeries);
  const lastDateInData = getLastDateInData(responseTimeSeries);

  const startAtMonday = startAtMoment
    ? roundDownToMonday(startAtMoment)
    : roundDownToMonday(firstDateInData)

  const endAtMonday = endAtMoment
    ? roundDownToMonday(endAtMoment)
    : roundDownToMonday(lastDateInData)

  let currentMonday = startAtMonday.clone()

  const weeks: TimeSeries = [];

  while(currentMonday.isSameOrBefore(endAtMonday)) {
    const currentMondayISO = currentMonday.toISOString()
    const week = indexedTimeSeries.get(currentMondayISO)

    if (week) {
      weeks.push(week);
    } else {
      weeks.push(getEmptyWeek(currentMonday))
    }

    currentMonday = currentMonday.add({ day: 7 });
  }

  return weeks;
}

const indexTimeSeries = (
  responseTimeSeries: TimeSeriesResponse
): Map<string, TimeSeriesRow> => {
  return responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    acc.set(date.toISOString(), getWeek(row));

    return acc;
  }, new Map() as Map<string, TimeSeriesRow>)
}

const roundDownToMonday = (date: Moment) => {
  const dayNumber = date.isoWeekday();
  return date.clone().subtract({ day: dayNumber - 1 });
}

const getEmptyWeek = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0
})

const getWeek = (row: TimeSeriesResponseRow) => ({
  visitors: row.count_visitor_id,
  visits: row.count,
  date: getDate(row).format('YYYY-MM-DD')
})