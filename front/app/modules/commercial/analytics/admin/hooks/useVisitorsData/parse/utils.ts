import moment, { Moment } from 'moment';
import {
  TimeSeriesResponse,
  TimeSeriesResponseRow,
  TimeSeriesRow,
} from '../typings';

export const indexTimeSeries = (
  responseTimeSeries: TimeSeriesResponse
): Map<string, TimeSeriesRow> => {
  return responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    acc.set(date.toISOString(), parseRow(row));

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
