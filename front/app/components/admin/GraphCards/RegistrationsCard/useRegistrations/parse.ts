import moment, { Moment } from 'moment';

import {
  TimeSeriesResponseRow,
  RegistrationsResponse,
} from 'api/graph_data_units/responseTypes/RegistrationsWidget';

import { RESOLUTION_TO_MESSAGE_KEY } from 'components/admin/GraphCards/_utils/resolution';
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys, get } from 'utils/helperUtils';

import { formatPercentage } from '../../_utils/format';

import { Translations } from './translations';
import { TimeSeries, TimeSeriesRow, Stats } from './typings';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  registrations: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    registrations: row.registrations,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'date_group'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: RegistrationsResponse['data']['attributes']['registrations_timeseries'],
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
  data: RegistrationsResponse['data']['attributes']
): Stats => {
  const {
    registrations_whole_period,
    registration_rate_whole_period,
    registrations_compared_period,
    registration_rate_compared_period,
  } = data;

  return {
    registrations: {
      value: registrations_whole_period.toString(),
      lastPeriod: (registrations_compared_period ?? 0).toString(),
    },
    registrationRate: {
      value: formatPercentage(registration_rate_whole_period),
      lastPeriod: formatPercentage(registration_rate_compared_period),
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
    [translations.registrations]: row.registrations,
  }));

  return {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
