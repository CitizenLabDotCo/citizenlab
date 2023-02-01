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
  comments: 0,
  total: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    total: 0,
    comments: row.count,
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

  if (
    !timeSeries ||
    timeSeries.length === 0 ||
    typeof total[0]?.count !== 'number'
  ) {
    return null;
  }

  // Calculate cumulative series by taking the total as the last item
  // in the serie and substract it with each time period value
  let totalCount = total[0]?.count;
  timeSeries = orderBy(
    timeSeries,
    (o: TimeSeriesRow) => {
      return moment(o.date).format('YYYYMMDD');
    },
    ['desc']
  )
    .map((row) => {
      const _totalCount = totalCount;
      totalCount = totalCount - row.comments;
      return {
        ...row,
        total: _totalCount,
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
    [translations.comments]: row.comments,
  }));

  return {
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
