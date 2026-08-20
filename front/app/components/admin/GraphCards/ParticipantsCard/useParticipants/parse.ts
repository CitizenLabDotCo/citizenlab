import { format, parseISO } from 'date-fns';

import {
  ParticipantsResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/ParticipantsWidget';

import { RESOLUTION_TO_MESSAGE_KEY } from 'components/admin/GraphCards/_utils/resolution';
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { keys, get } from 'utils/helperUtils';

import { formatPercentage } from '../../_utils/format';

import { Translations } from './translations';
import { TimeSeries, TimeSeriesRow, Stats } from './typings';

export const getEmptyRow = (date: Date): TimeSeriesRow => ({
  date: format(date, 'yyyy-MM-dd'),
  participants: 0,
  visitors: 0,
});

const parseRow = (date: Date, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    participants: row.participants,
    visitors: row.visitors ?? 0,
    date: format(date, 'yyyy-MM-dd'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return parseISO(get(row, 'date_group'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: ParticipantsResponse['data']['attributes']['participants_timeseries'],
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null,
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
  const {
    participants_whole_period,
    participation_rate_whole_period,
    participants_compared_period,
    participation_rate_compared_period,
  } = data;

  return {
    participants: {
      value: participants_whole_period.toString(),
      lastPeriod: (participants_compared_period ?? 0).toString(),
    },
    participationRate: {
      value: formatPercentage(participation_rate_whole_period),
      lastPeriod: formatPercentage(participation_rate_compared_period),
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
