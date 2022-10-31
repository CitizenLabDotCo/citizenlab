import { Moment } from 'moment';

// utils
import { dateGetter, timeSeriesParser } from '../../utils/timeSeries';
import { roundPercentage } from 'utils/math';
import { RESOLUTION_TO_MESSAGE_KEY } from '../useVisitors/parse';

// typings
import {
  Response,
  TimeSeriesResponseRow,
  TimeSeries,
  TimeSeriesRow,
  Stats,
} from './typings';
import { Translations } from './translations';
import { IResolution } from 'components/admin/ResolutionControl';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  registrations: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    registrations: row.count,
    date: getDate(row).format('YYYY-MM-DD'),
  };
};

const getDate = dateGetter<TimeSeriesResponseRow>(
  'dimension_date_registration'
);
const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: TimeSeriesResponseRow[],
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

export const parseStats = (data: Response['data']): Stats => {
  const registrationsWholePeriod = data[1][0];
  const registrationsLastPeriod = data[2][0];
  const visitsWholePeriod = data[3][0];
  const visitsLastPeriod = data[4][0];

  const conversionRateWholePeriod = getConversionRate(
    registrationsWholePeriod.count,
    visitsWholePeriod.count_visitor_id
  );

  const conversionRateLastPeriod = getConversionRate(
    registrationsLastPeriod.count,
    visitsLastPeriod.count_visitor_id
  );

  return {
    registrations: {
      value: registrationsWholePeriod.count.toString(),
      lastPeriod: registrationsLastPeriod.count.toString(),
    },
    conversionRate: {
      value: conversionRateWholePeriod,
      lastPeriod: conversionRateLastPeriod,
    },
  };
};

export const getConversionRate = (from: number, to: number) => {
  if (to <= 0) return `0%`;
  return `${Math.min(100, roundPercentage(from, to))}%`;
};

export const parseExcelData = (
  stats: Stats,
  timeSeries: TimeSeries | null,
  resolution: IResolution,
  translations: Translations
) => {
  const lastPeriod = translations[RESOLUTION_TO_MESSAGE_KEY[resolution]];
  const statsKeys: (keyof Stats)[] = ['registrations', 'conversionRate'];

  const statsData = statsKeys.map((statistic) => ({
    [translations.statistic]: translations[statistic],
    [translations.total]: stats[statistic].value,
    [lastPeriod]: stats[statistic].lastPeriod,
  }));

  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.date]: row.date,
    [translations.registrations]: row.registrations,
  }));

  return {
    [translations.stats]: statsData,
    ...(timeSeriesData
      ? { [translations.timeSeries]: timeSeriesData }
      : undefined),
  };
};
