import moment, { Moment } from 'moment';

import {
  ParticipantsResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/ParticipantsWidget';

import { getConversionRate } from 'components/admin/GraphCards/_utils/parse';
import { RESOLUTION_TO_MESSAGE_KEY } from 'components/admin/GraphCards/_utils/resolution';
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys, get } from 'utils/helperUtils';

import { Translations } from './translations';
import { TimeSeries, TimeSeriesRow, Stats } from './typings';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  participants: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    participants: row.count_participant_id,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: ParticipantsResponse['data']['attributes'][0],
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
  data: ParticipantsResponse['data']['attributes']
): Stats => {
  const participantsWholePeriod = data[1][0];
  const participantsLastPeriod = data[4]?.[0];

  const visitorsWholePeriod = data[2][0];
  const visitorsLastPeriod = data[5]?.[0];

  const activeVisitorUsersWholePeriod = data[3][0];
  const activeVisitorUsersLastPeriod = data[6]?.[0];

  const participationRateWholePeriod = getConversionRate(
    activeVisitorUsersWholePeriod?.count_participant_id ?? 0,
    visitorsWholePeriod?.count_visitor_id ?? 0
  );

  const participationRateRateLastPeriod = getConversionRate(
    activeVisitorUsersLastPeriod?.count_participant_id ?? 0,
    visitorsLastPeriod?.count_visitor_id ?? 0
  );

  return {
    participants: {
      value: (participantsWholePeriod?.count_participant_id ?? 0).toString(),
      lastPeriod: (
        participantsLastPeriod?.count_participant_id ?? 0
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
    [translations.participants]: row.participants,
  }));

  return {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
