import { format, parseISO } from 'date-fns';

import {
  ParticipationResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/ParticipationWidget';

import {
  timeSeriesParser,
  calculateCumulativeSerie,
} from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { get } from 'utils/helperUtils';

import { Translations } from './translations';
import { TimeSeries, TimeSeriesRow } from './typings';

export const getEmptyRow = (date: Date) => ({
  date: format(date, 'yyyy-MM-dd'),
  inputs: 0,
  total: 0,
});

const parseRow = (date: Date, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    total: 0,
    inputs: row.count,
    date: format(date, 'yyyy-MM-dd'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return parseISO(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: ParticipationResponse['data']['attributes'][0],
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null,
  resolution: IResolution
): TimeSeries | null => {
  const timeSeries = _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );

  const total = sumTimeSeries(responseTimeSeries);

  if (!timeSeries || timeSeries.length === 0 || typeof total !== 'number') {
    return null;
  }

  return calculateCumulativeSerie(
    timeSeries,
    total,
    (row: TimeSeriesRow) => row.inputs
  );
};

export const parseExcelData = (
  timeSeries: TimeSeries | null,
  translations: Translations
) => {
  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.date]: row.date,
    [translations.inputs]: row.inputs,
  }));

  return {
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};

const sumTimeSeries = (timeSeries: TimeSeriesResponseRow[]) => {
  return timeSeries.reduce((acc, { count }) => acc + count, 0);
};
