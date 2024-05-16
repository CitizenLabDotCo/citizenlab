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
    visitors: row.count_visitor_id,
    visits: row.count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_first_action_date'));
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

export const parseStats = ([
  _,
  totalsWholePeriodRows,
  totalsLastPeriodRows,
]: VisitorsResponse['data']['attributes']): Stats => {
  const wholePeriod = totalsWholePeriodRows[0];
  const lastPeriod = totalsLastPeriodRows?.[0];

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
  return round(+pageViews, 2).toLocaleString();
};

const parseVisitDuration = (seconds: string | null | undefined) => {
  if (!seconds) return '-';
  return new Date(+seconds * 1000).toISOString().substring(11, 19);
};
