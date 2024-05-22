import moment, { Moment } from 'moment';

import {
  ParticipationResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/ParticipationWidget';

import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { get } from 'utils/helperUtils';

import { CombinedTimeSeriesRow, GenericTimeSeriesRow } from '../typings';

const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  count: 0,
});

const parseRow = (
  date: Moment,
  row?: TimeSeriesResponseRow
): GenericTimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    count: row.count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

const parseTimeSeries = (
  responseTimeSeries: TimeSeriesResponseRow[],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
): GenericTimeSeriesRow[] | null => {
  return _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
};

const combineTimeSeries = (
  inputsTimeSeries: GenericTimeSeriesRow[] | null,
  commentsTimeSeries: GenericTimeSeriesRow[] | null,
  votesTimeSeries: GenericTimeSeriesRow[] | null
): CombinedTimeSeriesRow[] | null => {
  const definedSeries =
    inputsTimeSeries ?? commentsTimeSeries ?? votesTimeSeries;
  if (!definedSeries) return null;

  return definedSeries.map((row, i) => ({
    date: row.date,
    inputs: inputsTimeSeries?.[i].count ?? 0,
    comments: commentsTimeSeries?.[i].count ?? 0,
    votes: votesTimeSeries?.[i].count ?? 0,
  }));
};

export const parseCombinedTimeSeries = (
  [
    inputsTimeSeries,
    commentsTimeSeries,
    votesTimeSeries,
  ]: ParticipationResponse['data']['attributes'],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
) => {
  const parsedInputTimeSeries = parseTimeSeries(
    inputsTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
  const parsedCommentsTimeSeries = parseTimeSeries(
    commentsTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
  const parsedVotesTimeSeries = parseTimeSeries(
    votesTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );

  return combineTimeSeries(
    parsedInputTimeSeries,
    parsedCommentsTimeSeries,
    parsedVotesTimeSeries
  );
};
