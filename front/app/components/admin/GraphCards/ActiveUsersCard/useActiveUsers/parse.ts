import moment, { Moment } from 'moment';

import { getConversionRate } from 'components/admin/GraphCards/_utils/parse';
import { RESOLUTION_TO_MESSAGE_KEY } from 'components/admin/GraphCards/_utils/resolution';
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys, get } from 'utils/helperUtils';

import { Translations } from './translations';
import {
  Response,
  TimeSeriesResponseRow,
  TimeSeriesRow,
  TimeSeries,
  Stats,
} from './typings';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  activeUsers: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    activeUsers: row.count_dimension_user_id,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: Response['data']['attributes'][0],
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

export const parseStats = (data: Response['data']['attributes']): Stats => {
  const activeUsersWholePeriod = data[1][0];
  const activeUsersLastPeriod = data[2][0];
  const visitsWholePeriod = data[3][0];
  const visitsLastPeriod = data[4][0];

  const participationRateWholePeriod = getConversionRate(
    activeUsersWholePeriod?.count_dimension_user_id ?? 0,
    visitsWholePeriod?.count_visitor_id ?? 0
  );

  const participationRateRateLastPeriod = getConversionRate(
    activeUsersLastPeriod?.count_dimension_user_id ?? 0,
    visitsLastPeriod?.count_visitor_id ?? 0
  );

  return {
    activeUsers: {
      value: (activeUsersWholePeriod?.count_dimension_user_id ?? 0).toString(),
      lastPeriod: (
        activeUsersLastPeriod?.count_dimension_user_id ?? 0
      ).toString(),
    },
    participationRate: {
      value: participationRateWholePeriod,
      lastPeriod: participationRateRateLastPeriod,
    },
  };
};

export const parseExcelData = (
  stats: Stats,
  timeSeries: TimeSeries | null,
  resolution: IResolution,
  translations: Translations
) => {
  const lastPeriod = translations[RESOLUTION_TO_MESSAGE_KEY[resolution]];

  const statsData = keys(stats).map((key) => ({
    [translations.statistic]: translations[key],
    [translations.total]: stats[key].value,
    [lastPeriod]: stats[key].lastPeriod,
  }));

  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.date]: row.date,
    [translations.participants]: row.activeUsers,
  }));

  return {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
