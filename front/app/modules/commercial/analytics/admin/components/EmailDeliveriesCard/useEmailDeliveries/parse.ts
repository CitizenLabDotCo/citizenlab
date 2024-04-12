import { groupBy } from 'lodash-es';
import moment, { Moment } from 'moment';

import { getInterval } from 'components/admin/GraphCards/_utils/query';
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys } from 'utils/helperUtils';

import { Translations } from './translations';
import {
  Response,
  Stats,
  TimeSeries,
  TimeSeriesResponseRow,
  TimeSeriesRow,
  PreparedTimeSeriesResponse,
  PreparedTimeSeriesResponseRow,
} from './typings';

export const mergeTimeSeries = (
  timeSeriesQuery: TimeSeriesResponseRow[],
  currentResolution: IResolution
) => {
  const dateColumn = `first_dimension_date_sent_${getInterval(
    currentResolution
  )}`;
  const groupedTimeSerie = groupBy(timeSeriesQuery, dateColumn);

  return Object.values(groupedTimeSerie).map((values) => ({
    [dateColumn]: values[0][dateColumn],
    automated:
      values.find((row: TimeSeriesResponseRow) => row.automated === true)
        ?.count ?? 0,
    custom:
      values.find((row: TimeSeriesResponseRow) => row.automated === false)
        ?.count ?? 0,
  }));
};

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  automated: 0,
  custom: 0,
});

const parseRow = (
  date: Moment,
  row?: PreparedTimeSeriesResponseRow
): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    automated: row.automated,
    custom: row.custom,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: PreparedTimeSeriesResponseRow) => {
  const dateAttribute =
    row.first_dimension_date_sent_date ||
    row.first_dimension_date_sent_week ||
    row.first_dimension_date_sent_month;

  return moment(dateAttribute);
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  timeSeriesQuery: PreparedTimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
): TimeSeries | null => {
  return _parseTimeSeries(
    timeSeriesQuery,
    startAtMoment,
    endAtMoment,
    resolution
  );
};

export const parseStats = ([
  totalEmailsDeliveries,
  customEmailsDeliveries,
  automatedEmailsDeliveries,
]: Response['data']['attributes']): Stats => ({
  total: totalEmailsDeliveries[0]?.count,
  custom: customEmailsDeliveries[0]?.count,
  customCampaigns: customEmailsDeliveries[0]?.count_campaign_id,
  automated: automatedEmailsDeliveries[0]?.count,
  automatedCampaigns: automatedEmailsDeliveries[0]?.count_campaign_id,
});

export const parseExcelData = (
  stats: Stats,
  timeSeries: TimeSeries | null,
  translations: Translations
) => {
  const statsData = keys(stats).map((key) => ({
    [translations.statistic]: translations[key],
    [translations.total]: stats[key],
  }));

  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.custom]: row.custom,
    [translations.automated]: row.automated,
    [translations.date]: row.date,
  }));

  return {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
