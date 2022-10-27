import moment, { Moment } from 'moment';
import {
  TimeSeriesResponse,
  TimeSeriesResponseRow,
  TimeSeriesRow,
} from '../typings';
import { IResolution } from 'components/admin/ResolutionControl';
import { round } from 'lodash-es';

export const roundDateToMidnight = (date: Moment) => {
  return moment(date.format('YYYY-MM-DD'));
};

export const indexTimeSeries = (
  responseTimeSeries: TimeSeriesResponse
): Map<string, TimeSeriesRow> => {
  return responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    acc.set(date.format('YYYY-MM-DD'), parseRow(row));

    return acc;
  }, new Map() as Map<string, TimeSeriesRow>);
};

const parseRow = (row: TimeSeriesResponseRow): TimeSeriesRow => ({
  visitors: row.count_visitor_id,
  visits: row.count,
  date: getDate(row).format('YYYY-MM-DD'),
});

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0,
});

export const getFirstDateInData = (responseTimeSeries: TimeSeriesResponse) => {
  const firstMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    return date.isAfter(acc) ? acc : date;
  }, moment());

  return firstMonthInData;
};

export const getLastDateInData = (responseTimeSeries: TimeSeriesResponse) => {
  const lastMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    return date.isAfter(acc) ? date : acc;
  }, moment('1970-01-01'));

  return lastMonthInData;
};

const getDate = (row: TimeSeriesResponseRow) => {
  if ('dimension_date_last_action.month' in row) {
    return moment(row['dimension_date_last_action.month']);
  }

  if ('dimension_date_last_action.week' in row) {
    return moment(row['dimension_date_last_action.week']);
  }

  return moment(row['dimension_date_last_action.date']);
};

type TimeDelta = { month: 1 } | { day: 7 } | { day: 1 };

const TIME_DELTA_MAP: Record<IResolution, TimeDelta> = {
  month: { month: 1 },
  week: { day: 7 },
  day: { day: 1 },
};

export const dateRange = (start: Moment, end: Moment, step: IResolution) => {
  const timeDelta = TIME_DELTA_MAP[step];
  const dates: Moment[] = [];

  let currentDate = start.clone();

  // Should not be possible, but just in case to avoid
  // infinite loop
  if (start.isAfter(end)) return null;

  while (currentDate.isSameOrBefore(end)) {
    dates.push(currentDate.clone());
    currentDate = currentDate.add(timeDelta);
  }

  return dates;
};

export const parsePageViews = (pageViews: string | null | undefined) => {
  if (!pageViews) return '-';
  return round(+pageViews, 2).toString();
};

export const parseVisitDuration = (seconds: string | null | undefined) => {
  if (!seconds) return '-';
  return new Date(+seconds * 1000).toISOString().substring(11, 19);
};
