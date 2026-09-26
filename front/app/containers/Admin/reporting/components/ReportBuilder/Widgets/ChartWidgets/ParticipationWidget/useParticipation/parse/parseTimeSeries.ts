import { format, max, min, parseISO } from 'date-fns';

import {
  ParticipationResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/ParticipationWidget';

import {
  timeSeriesParser,
  getFirstDateInData,
  getLastDateInData,
} from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { get } from 'utils/helperUtils';

import { CombinedTimeSeriesRow, GenericTimeSeriesRow } from '../../typings';

const getEmptyRow = (date: Date) => ({
  date: format(date, 'yyyy-MM-dd'),
  count: 0,
});

const parseRow = (
  date: Date,
  row?: TimeSeriesResponseRow
): GenericTimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    count: row.count,
    date: format(date, 'yyyy-MM-dd'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return parseISO(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

const parseTimeSeries = (
  responseTimeSeries: TimeSeriesResponseRow[],
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null,
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
  providedStartAtMoment: Date | null | undefined,
  providedEndAtMoment: Date | null,
  resolution: IResolution
) => {
  const startAtMoment =
    providedStartAtMoment ??
    getFirstDateInTimeSeries(
      inputsTimeSeries,
      commentsTimeSeries,
      votesTimeSeries
    );

  const endAtMoment =
    providedEndAtMoment ??
    getLastDateInTimeSeries(
      inputsTimeSeries,
      commentsTimeSeries,
      votesTimeSeries
    );

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

const getFirstDateInTimeSeries = (
  inputsTimeSeries: TimeSeriesResponseRow[],
  commentsTimeSeries: TimeSeriesResponseRow[],
  votesTimeSeries: TimeSeriesResponseRow[]
) => {
  const firstDateInDataInputs = getFirstDateInData(inputsTimeSeries, getDate);
  const firstDateInDataComments = getFirstDateInData(
    commentsTimeSeries,
    getDate
  );
  const firstDateInDataVotes = getFirstDateInData(votesTimeSeries, getDate);

  return min([
    firstDateInDataInputs,
    firstDateInDataComments,
    firstDateInDataVotes,
  ]);
};

const getLastDateInTimeSeries = (
  inputsTimeSeries: TimeSeriesResponseRow[],
  commentsTimeSeries: TimeSeriesResponseRow[],
  votesTimeSeries: TimeSeriesResponseRow[]
) => {
  const lastDateInDataInputs = getLastDateInData(inputsTimeSeries, getDate);
  const lastDateInDataComments = getLastDateInData(commentsTimeSeries, getDate);
  const lastDateInDataVotes = getLastDateInData(votesTimeSeries, getDate);

  return max([
    lastDateInDataInputs,
    lastDateInDataComments,
    lastDateInDataVotes,
  ]);
};
