import { Moment } from 'moment';

// utils
import { dateGetter, timeSeriesParser } from '../../utils/timeSeries';
import { roundPercentage } from 'utils/math';
import { keys } from 'utils/helperUtils';
import { RESOLUTION_TO_MESSAGE_KEY } from '../../utils/resolution';

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

const getDate = dateGetter('dimension_date_registration');
const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: Response['data'][0],
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

  const registrationRateWholePeriod = getConversionRate(
    registrationsWholePeriod?.count ?? 0,
    visitsWholePeriod?.count_visitor_id ?? 0
  );

  const registrationRateLastPeriod = getConversionRate(
    registrationsLastPeriod?.count ?? 0,
    visitsLastPeriod?.count_visitor_id ?? 0
  );

  return {
    registrations: {
      value: (registrationsWholePeriod?.count ?? 0).toString(),
      lastPeriod: (registrationsWholePeriod?.count ?? 0).toString(),
    },
    registrationRate: {
      value: registrationRateWholePeriod,
      lastPeriod: registrationRateLastPeriod,
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

  const statsData = keys(stats).map((key) => ({
    [translations.statistic]: translations[key],
    [translations.total]: stats[key].value,
    [lastPeriod]: stats[key].lastPeriod,
  }));

  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.date]: row.date,
    [translations.registrations]: row.registrations,
  }));

  return {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
