import moment, { Moment } from 'moment';

// utils
import { round } from 'lodash-es';
import * as timeSerieUtils from '../../../utils/timeSeries';

// typings
import {
  TimeSeriesResponse,
  TimeSeriesResponseRow,
  TimeSeriesRow,
} from '../typings';

export const indexTimeSeries = (
  responseTimeSeries: TimeSeriesResponse
): Map<string, TimeSeriesRow> => {
  return timeSerieUtils.indexTimeSeries(responseTimeSeries, getDate, parseRow);
};

export const getFirstDateInData = (responseTimeSeries: TimeSeriesResponse) => {
  return timeSerieUtils.getFirstDateInData(responseTimeSeries, getDate);
};

export const getLastDateInData = (responseTimeSeries: TimeSeriesResponse) => {
  return timeSerieUtils.getLastDateInData(responseTimeSeries, getDate);
};

const parseRow = (row: TimeSeriesResponseRow): TimeSeriesRow => ({
  visitors: row.count_visitor_id,
  visits: row.count,
  date: getDate(row).format('YYYY-MM-DD'),
});

const getDate = (row: TimeSeriesResponseRow) => {
  if ('dimension_date_last_action.month' in row) {
    return moment(row['dimension_date_last_action.month']);
  }

  if ('dimension_date_last_action.week' in row) {
    return moment(row['dimension_date_last_action.week']);
  }

  return moment(row['dimension_date_last_action.date']);
};

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0,
});

export const parsePageViews = (pageViews: string | null | undefined) => {
  if (!pageViews) return '-';
  return round(+pageViews, 2).toString();
};

export const parseVisitDuration = (seconds: string | null | undefined) => {
  if (!seconds) return '-';
  return new Date(+seconds * 1000).toISOString().substring(11, 19);
};
