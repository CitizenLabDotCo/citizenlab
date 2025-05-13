import { round } from 'lodash-es';
import moment, { Moment } from 'moment';

import {
  VisitorsResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/VisitorsWidget';

import { IResolution } from 'components/admin/ResolutionControl';

import { keys, get } from 'utils/helperUtils';

import { RESOLUTION_TO_MESSAGE_KEY } from '../../_utils/resolution';
import { timeSeriesParser } from '../../_utils/timeSeries';

import { Translations } from './translations';
import { Stats, TimeSeries, TimeSeriesRow } from './typings';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    visitors: row.visitors,
    visits: row.visits,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'date_group'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: VisitorsResponse['data']['attributes']['visitors_timeseries'],
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

export const parseStats = (
  attributes: VisitorsResponse['data']['attributes']
): Stats => {
  const {
    visitors_whole_period,
    visitors_compared_period,
    visits_whole_period,
    visits_compared_period,
    avg_seconds_per_session_whole_period,
    avg_seconds_per_session_compared_period,
    avg_pages_visited_whole_period,
    avg_pages_visited_compared_period,
  } = attributes;

  return {
    visitors: {
      value: visitors_whole_period.toLocaleString(),
      lastPeriod: visitors_compared_period?.toLocaleString() ?? '0',
    },
    visits: {
      value: visits_whole_period.toLocaleString(),
      lastPeriod: visits_compared_period?.toLocaleString() ?? '0',
    },
    visitDuration: {
      value: parseVisitDuration(avg_seconds_per_session_whole_period),
      lastPeriod: parseVisitDuration(avg_seconds_per_session_compared_period),
    },
    pageViews: {
      value: parsePageViews(avg_pages_visited_whole_period),
      lastPeriod: parsePageViews(avg_pages_visited_compared_period),
    },
  };
};

export const parseExcelData = (
  stats: Stats,
  timeSeries: TimeSeries | null,
  translations: Translations,
  resolution: IResolution
) => {
  const lastPeriod = translations[RESOLUTION_TO_MESSAGE_KEY[resolution]];

  const statsData = keys(stats).map((key) => ({
    [translations.statistic]: translations[key],
    [translations.total]: stats[key].value,
    [lastPeriod]: stats[key].lastPeriod,
  }));

  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.visits]: row.visits,
    [translations.visitors]: row.visitors,
    [translations.date]: row.date,
  }));

  return {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};

const parsePageViews = (pageViews: number | undefined) => {
  if (!pageViews) return '-';
  return formatPageViews(pageViews);
};

export const formatPageViews = (pageViews: number) => {
  return round(pageViews, 2).toLocaleString();
};

const parseVisitDuration = (seconds: number | undefined) => {
  if (!seconds) return '-';
  return formatVisitDuration(seconds);
};

export const formatVisitDuration = (seconds: number) => {
  const isNegative = seconds < 0;
  const value = new Date(Math.abs(seconds) * 1000)
    .toISOString()
    .substring(11, 19);

  return isNegative ? `-${value}` : value;
};
