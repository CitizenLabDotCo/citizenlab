import moment, { Moment } from 'moment';

import {
  InternalAdoptionResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/InternalAdoptionWidget';

import { RESOLUTION_TO_MESSAGE_KEY } from 'components/admin/GraphCards/_utils/resolution';
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys } from 'utils/helperUtils';

import { Stats, TimeSeriesRow, CombinedTimeSeriesRow } from '../typings';

import { Translations } from './translations';

const getEmptyRow = (date: Moment): TimeSeriesRow => ({
  date: date.format('YYYY-MM-DD'),
  count: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    count: row.count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(row.date_group);
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

const parseSingleTimeSeries = (
  responseTimeSeries: TimeSeriesResponseRow[],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
): TimeSeriesRow[] | null => {
  return _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
};

const combineTimeSeries = (
  adminsTimeSeries: TimeSeriesRow[] | null,
  moderatorsTimeSeries: TimeSeriesRow[] | null
): CombinedTimeSeriesRow[] | null => {
  const definedSeries = adminsTimeSeries ?? moderatorsTimeSeries;
  if (!definedSeries) return null;

  return definedSeries.map((row, i) => {
    const activeAdmins = adminsTimeSeries?.[i].count ?? 0;
    const activeModerators = moderatorsTimeSeries?.[i].count ?? 0;

    return {
      date: row.date,
      activeAdmins,
      activeModerators,
      totalActive: activeAdmins + activeModerators,
    };
  });
};

export const parseTimeSeries = (
  attributes: InternalAdoptionResponse['data']['attributes'],
  startAtMoment: Moment | null,
  endAtMoment: Moment | null,
  resolution: IResolution
): CombinedTimeSeriesRow[] => {
  const { active_admins_timeseries, active_moderators_timeseries } = attributes;

  const parsedAdminsTimeSeries = parseSingleTimeSeries(
    active_admins_timeseries,
    startAtMoment,
    endAtMoment,
    resolution
  );

  const parsedModeratorsTimeSeries = parseSingleTimeSeries(
    active_moderators_timeseries,
    startAtMoment,
    endAtMoment,
    resolution
  );

  return (
    combineTimeSeries(parsedAdminsTimeSeries, parsedModeratorsTimeSeries) ?? []
  );
};

export const parseStats = (
  attributes: InternalAdoptionResponse['data']['attributes']
): Stats => {
  const {
    active_admins_count,
    active_moderators_count,
    total_registered_count,
    active_admins_compared,
    active_moderators_compared,
    total_registered_compared,
  } = attributes;

  return {
    activeAdmins: {
      value: active_admins_count,
      lastPeriod: active_admins_compared,
    },
    activeModerators: {
      value: active_moderators_count,
      lastPeriod: active_moderators_compared,
    },
    totalRegistered: {
      value: total_registered_count,
      lastPeriod: total_registered_compared,
    },
  };
};

export const parseExcelData = (
  stats: Stats,
  timeSeries: CombinedTimeSeriesRow[] | null,
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
    [translations.activeAdmins]: row.activeAdmins,
    [translations.activeModerators]: row.activeModerators,
    [translations.totalActive]: row.totalActive,
  }));

  return {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
