import moment, { Moment } from 'moment';

import { ReactionsByTimeResponse } from 'api/graph_data_units/responseTypes';

import {
  timeSeriesParser,
  calculateCumulativeSerie,
} from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { get } from 'utils/helperUtils';

import { Translations } from './translations';
import {
  TimeSeriesResponseRow,
  TimeSeries,
  TimeSeriesRow,
  SingleTimeSeriesRow,
} from './typings';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  reactions: 0,
});

const parseRow = (
  date: Moment,
  row?: TimeSeriesResponseRow
): SingleTimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    reactions: row.count_reaction_id,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  response: ReactionsByTimeResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
): TimeSeries | null => {
  const [likeTimeSeriesResponse, dislikeTimeSeriesResponse, totalResponse] =
    response.data.attributes;

  const likeTimeSeries = _parseTimeSeries(
    likeTimeSeriesResponse,
    startAtMoment,
    endAtMoment,
    resolution
  );

  const dislikeTimeSeries = _parseTimeSeries(
    dislikeTimeSeriesResponse,
    startAtMoment,
    endAtMoment,
    resolution
  );

  if (
    !likeTimeSeries ||
    !dislikeTimeSeries ||
    likeTimeSeries.length === 0 ||
    dislikeTimeSeries.length === 0 ||
    typeof totalResponse[0]?.count_reaction_id !== 'number'
  ) {
    return null;
  }

  const combinedTimeSeries = combineTimeSeries(
    likeTimeSeries,
    dislikeTimeSeries
  );
  if (!combinedTimeSeries) return null;

  return calculateCumulativeSerie(
    combinedTimeSeries,
    totalResponse[0]?.count_reaction_id,
    (row: TimeSeriesRow) => row.likes + row.dislikes
  );
};

const combineTimeSeries = (
  likeTimeSeries: SingleTimeSeriesRow[],
  dislikeTimeSeries: SingleTimeSeriesRow[]
): TimeSeriesRow[] | null => {
  if (likeTimeSeries.length !== dislikeTimeSeries.length) {
    return null;
  }

  return likeTimeSeries.map((likeRow, index) => ({
    date: likeRow.date,
    likes: likeRow.reactions,
    dislikes: dislikeTimeSeries[index].reactions,
    total: 0,
  }));
};

export const parseExcelData = (
  timeSeries: TimeSeries | null,
  translations: Translations
) => {
  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.date]: row.date,
    [translations.likes]: row.likes,
    [translations.dislikes]: row.dislikes,
  }));

  return {
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};
