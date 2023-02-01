import moment, { Moment } from 'moment';

// utils
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { get } from 'utils/helperUtils';
import { orderBy } from 'lodash-es';

// typings
import {
  Response,
  TimeSeriesResponseRow,
  TimeSeries,
  TimeSeriesRow,
} from './typings';
import { Translations } from './translations';
import { IResolution } from 'components/admin/ResolutionControl';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  upvotes: 0,
  downvotes: 0,
  total: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    total: 0,
    upvotes: row.sum_upvotes_count,
    downvotes: row.sum_downvotes_count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: Response['data'][0],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution,
  total: Response['data'][1]
): TimeSeries | null => {
  let timeSeries = _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
  if (!timeSeries) return [];
  let totalCount = total[0]?.sum_votes_count;
  timeSeries = orderBy(
    timeSeries,
    (o: TimeSeriesRow) => {
      return moment(o.date).format('YYYYMMDD');
    },
    ['desc']
  )
    .map((row) => {
      const _totalCount = totalCount;
      totalCount = (totalCount || 0) - row.upvotes - row.downvotes;
      return {
        ...row,
        total: _totalCount || 0,
      };
    })
    .reverse();
  return timeSeries;
};

export const parseExcelData = (
  timeSeries: TimeSeries | null,
  translations: Translations
) => {
  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.date]: row.date,
    [translations.upvotes]: row.upvotes,
    [translations.downvotes]: row.downvotes,
  }));

  return {
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
