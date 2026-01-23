import moment, { Moment } from 'moment';

import {
  InternalAdoptionResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/InternalAdoptionWidget';

import { RESOLUTION_TO_MESSAGE_KEY } from 'components/admin/GraphCards/_utils/resolution';
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys } from 'utils/helperUtils';

import { Stats, CombinedTimeSeriesRow } from '../typings';

import { Translations } from './translations';

const getEmptyRow = (date: Moment): CombinedTimeSeriesRow => ({
  date: date.format('YYYY-MM-DD'),
  activeAdmins: 0,
  activeModerators: 0,
  totalActive: 0,
});

const parseRow = (
  date: Moment,
  row?: TimeSeriesResponseRow
): CombinedTimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  const activeAdmins = row.active_admins;
  const activeModerators = row.active_moderators;

  return {
    date: date.format('YYYY-MM-DD'),
    activeAdmins,
    activeModerators,
    totalActive: activeAdmins + activeModerators,
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(row.date_group);
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  attributes: InternalAdoptionResponse['data']['attributes'],
  startAtMoment: Moment | null,
  endAtMoment: Moment | null,
  resolution: IResolution
): CombinedTimeSeriesRow[] => {
  const { timeseries } = attributes;

  return (
    _parseTimeSeries(timeseries, startAtMoment, endAtMoment, resolution) ?? []
  );
};

export const parseStats = (
  attributes: InternalAdoptionResponse['data']['attributes']
): Stats => {
  const {
    active_admins_count,
    active_moderators_count,
    total_admin_pm_count,
    active_admins_compared,
    active_moderators_compared,
    total_admin_pm_compared,
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
    totalAdminPm: {
      value: total_admin_pm_count,
      lastPeriod: total_admin_pm_compared,
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
