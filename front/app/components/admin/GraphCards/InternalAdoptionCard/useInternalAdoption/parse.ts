import { format, parseISO } from 'date-fns';

import {
  InternalAdoptionResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/InternalAdoptionWidget';

import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys } from 'utils/helperUtils';

import { Stats, CombinedTimeSeriesRow } from '../typings';

import { Translations } from './translations';

const getEmptyRow = (date: Date): CombinedTimeSeriesRow => ({
  date: format(date, 'yyyy-MM-dd'),
  activeAdmins: 0,
  activeModerators: 0,
  totalActive: 0,
});

const parseRow = (
  date: Date,
  row?: TimeSeriesResponseRow
): CombinedTimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  const activeAdmins = row.active_admins;
  const activeModerators = row.active_moderators;

  return {
    date: format(date, 'yyyy-MM-dd'),
    activeAdmins,
    activeModerators,
    totalActive: activeAdmins + activeModerators,
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return parseISO(row.date_group);
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  attributes: InternalAdoptionResponse['data']['attributes'],
  startAtMoment: Date | null,
  endAtMoment: Date | null,
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
    admin_counts,
    moderator_counts,
    admin_counts_compared,
    moderator_counts_compared,
  } = attributes;

  const adminActiveLastPeriod = admin_counts_compared?.active ?? 0;
  const moderatorActiveLastPeriod = moderator_counts_compared?.active ?? 0;

  return {
    admins: {
      registered: admin_counts.registered,
      active: admin_counts.active,
      activeLastPeriod: adminActiveLastPeriod,
    },
    moderators: {
      registered: moderator_counts.registered,
      active: moderator_counts.active,
      activeLastPeriod: moderatorActiveLastPeriod,
    },
    total: {
      registered: admin_counts.registered + moderator_counts.registered,
      active: admin_counts.active + moderator_counts.active,
      activeLastPeriod: adminActiveLastPeriod + moderatorActiveLastPeriod,
    },
  };
};

export const parseExcelData = (
  stats: Stats,
  timeSeries: CombinedTimeSeriesRow[] | null,
  translations: Translations
) => {
  const statsData = keys(stats).map((key) => ({
    [translations.statistic]: translations[key],
    [translations.registered]: stats[key].registered,
    [translations.activePeriodLabel]: stats[key].activeLastPeriod,
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
