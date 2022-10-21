import moment, { Moment } from 'moment';

// utils
import { round } from 'lodash-es';

// typings
import { TimeSeriesResponseRow, TimeSeriesRow } from '../typings';

export const parseRow = (
  date: Moment,
  row?: TimeSeriesResponseRow
): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    visitors: row.count_visitor_id,
    visits: row.count,
    date: getDate(row).format('YYYY-MM-DD'),
  };
};

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0,
});

export const getDate = (row: TimeSeriesResponseRow) => {
  if ('dimension_date_last_action.month' in row) {
    return moment(row['dimension_date_last_action.month']);
  }

  if ('dimension_date_last_action.week' in row) {
    return moment(row['dimension_date_last_action.week']);
  }

  return moment(row['dimension_date_last_action.date']);
};

export const parsePageViews = (pageViews: string | null | undefined) => {
  if (!pageViews) return '-';
  return round(+pageViews, 2).toString();
};

export const parseVisitDuration = (seconds: string | null | undefined) => {
  if (!seconds) return '-';
  return new Date(+seconds * 1000).toISOString().substring(11, 19);
};
