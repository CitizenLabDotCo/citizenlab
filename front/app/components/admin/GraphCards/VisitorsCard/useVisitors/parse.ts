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
    visitors: row.count_monthly_user_hash,
    visits: row.count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: VisitorsResponse['data']['attributes'][0],
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
  const sessionTotalsWholePeriod = attributes[1][0];
  const sessionTotalsLastPeriod = attributes[3]?.[0];

  const matomoVisitsWholePeriod = attributes[2][0];
  const matomoVisitsLastPeriod = attributes[4]?.[0];

  return {
    visitors: {
      value:
        sessionTotalsWholePeriod?.count_monthly_user_hash.toLocaleString() ??
        '0',
      lastPeriod:
        sessionTotalsLastPeriod?.count_monthly_user_hash.toLocaleString() ??
        '0',
    },
    visits: {
      value: sessionTotalsWholePeriod?.count.toLocaleString() ?? '0',
      lastPeriod: sessionTotalsLastPeriod?.count.toLocaleString() ?? '0',
    },
    visitDuration: {
      value: parseVisitDuration(matomoVisitsWholePeriod?.avg_duration),
      lastPeriod: parseVisitDuration(matomoVisitsLastPeriod?.avg_duration),
    },
    pageViews: {
      value: parsePageViews(matomoVisitsWholePeriod?.avg_pages_visited),
      lastPeriod: parsePageViews(matomoVisitsLastPeriod?.avg_pages_visited),
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

const parsePageViews = (pageViews: string | null | undefined) => {
  if (!pageViews) return '-';
  return formatPageViews(+pageViews);
};

export const formatPageViews = (pageViews: number) => {
  return round(pageViews, 2).toLocaleString();
};

const parseVisitDuration = (seconds: string | null | undefined) => {
  if (!seconds) return '-';
  return formatVisitDuration(+seconds);
};

export const formatVisitDuration = (seconds: number) => {
  const isNegative = seconds < 0;
  const value = new Date(Math.abs(seconds) * 1000)
    .toISOString()
    .substring(11, 19);

  return isNegative ? `-${value}` : value;
};
