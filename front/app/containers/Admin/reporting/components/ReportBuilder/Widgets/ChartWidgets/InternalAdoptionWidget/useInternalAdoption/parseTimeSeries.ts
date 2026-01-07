import moment, { Moment } from 'moment';

import {
  InternalAdoptionResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/InternalAdoptionWidget';

import {
  timeSeriesParser,
  getFirstDateInData,
  getLastDateInData,
} from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { CombinedTimeSeriesRow, TimeSeriesRow } from '../typings';

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

const getMinDateInTimeSeries = (
  adminsTimeSeries: TimeSeriesResponseRow[],
  moderatorsTimeSeries: TimeSeriesResponseRow[]
) => {
  const firstDateInAdmins = getFirstDateInData(adminsTimeSeries, getDate);
  const firstDateInModerators = getFirstDateInData(
    moderatorsTimeSeries,
    getDate
  );

  return moment.min([firstDateInAdmins, firstDateInModerators]);
};

const getMaxDateInTimeSeries = (
  adminsTimeSeries: TimeSeriesResponseRow[],
  moderatorsTimeSeries: TimeSeriesResponseRow[]
) => {
  const lastDateInAdmins = getLastDateInData(adminsTimeSeries, getDate);
  const lastDateInModerators = getLastDateInData(moderatorsTimeSeries, getDate);

  return moment.max([lastDateInAdmins, lastDateInModerators]);
};

export const parseTimeSeries = (
  attributes: InternalAdoptionResponse['data']['attributes'],
  providedStartAt: Moment | null,
  providedEndAt: Moment | null,
  resolution: IResolution
): CombinedTimeSeriesRow[] => {
  const { active_admins_timeseries, active_moderators_timeseries } = attributes;

  const startAtMoment =
    providedStartAt ??
    getMinDateInTimeSeries(
      active_admins_timeseries,
      active_moderators_timeseries
    );

  const endAtMoment =
    providedEndAt ??
    getMaxDateInTimeSeries(
      active_admins_timeseries,
      active_moderators_timeseries
    );

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
