import moment from 'moment';
import { TimeSeriesResponse, TimeSeriesResponseRow } from '../typings';

export const getFirstDateInData = (responseTimeSeries: TimeSeriesResponse) => {
  const firstMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row)
    return date.isAfter(acc) ? acc : date
  }, moment());

  return firstMonthInData;
}

export const getLastDateInData = (responseTimeSeries: TimeSeriesResponse) => {
  const lastMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row)
    return date.isAfter(acc) ? date : acc
  }, moment());

  return lastMonthInData;
}

export const getDate = (row: TimeSeriesResponseRow) => {
  if ('dimension_date_last_action.month' in row) {
    return moment(row['dimension_date_last_action.month'])
  }

  if ('dimension_date_last_action.week' in row) {
    return moment(row['dimension_date_last_action.week'])
  }

  return moment(row['dimension_date_last_action.date']);
}