import moment, { Moment } from 'moment';

// utils
import { round } from 'lodash-es';
import { timeSeriesParser } from '../../utils/timeSeries';
import { keys } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import {
  Response,
  Stats,
  TimeSeries,
  TimeSeriesResponse,
  TimeSeriesResponseRow,
  TimeSeriesRow,
} from './typings';
import { Translations } from './translations';

export const parseStats = ([
  totalsWholePeriodRows,
  totalsLastPeriodRows,
]: Response['data']): Stats => {
  const wholePeriod = totalsWholePeriodRows[0];
  const lastPeriod = totalsLastPeriodRows[0];

  return {
    visitors: {
      value: wholePeriod?.count_visitor_id.toLocaleString() ?? '0',
      lastPeriod: lastPeriod?.count_visitor_id.toLocaleString() ?? '0',
    },
    visits: {
      value: wholePeriod?.count.toLocaleString() ?? '0',
      lastPeriod: lastPeriod?.count.toLocaleString() ?? '0',
    },
    visitDuration: {
      value: parseVisitDuration(wholePeriod?.avg_duration),
      lastPeriod: parseVisitDuration(lastPeriod?.avg_duration),
    },
    pageViews: {
      value: parsePageViews(wholePeriod?.avg_pages_visited),
      lastPeriod: parsePageViews(lastPeriod?.avg_pages_visited),
    },
  };
};

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    visitors: row.count_visitor_id,
    visits: row.count,
    date: getDate(row).format('YYYY-MM-DD'),
  };
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

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
): TimeSeries | null => {
  return _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
};

export const RESOLUTION_TO_MESSAGE_KEY: Record<
  IResolution,
  keyof Translations
> = {
  month: 'last30Days',
  week: 'last7Days',
  day: 'yesterday',
};

export const parseExcelData = (
  stats: Stats,
  timeSeries: TimeSeries | null,
  translations: Translations,
  resolution: IResolution
) => {
  const lastPeriod = translations[RESOLUTION_TO_MESSAGE_KEY[resolution]];

  const statsData = keys(stats).map((key) => {
    const stat = stats[key];

    return {
      [translations.statistic]: translations[key],
      [translations.total]: stat.value,
      [lastPeriod]: stat.lastPeriod,
    };
  });

  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.visits]: row.visits,
    [translations.visitors]: row.visitors,
    [translations.date]: row.date,
  }));

  const xlsxData = {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };

  return xlsxData;
};

const parsePageViews = (pageViews: string | null | undefined) => {
  if (!pageViews) return '-';
  return round(+pageViews, 2).toString();
};

const parseVisitDuration = (seconds: string | null | undefined) => {
  if (!seconds) return '-';
  return new Date(+seconds * 1000).toISOString().substring(11, 19);
};
