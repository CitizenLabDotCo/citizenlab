import moment, { Moment } from 'moment';

// utils
import {
  timeSeriesParser,
  calculateCumulativeSerie,
} from 'components/admin/GraphCards/_utils/timeSeries';
import { get } from 'utils/helperUtils';

// typings
import { TimeSeriesResponseRow, TimeSeries, TimeSeriesRow } from './typings';
import { Translations } from './translations';
import { IResolution } from 'components/admin/ResolutionControl';
import { ReactionsByTimeResponse } from 'api/graph_data_units/responseTypes';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  likes: 0,
  dislikes: 0,
  total: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    total: 0,
    likes: row.sum_likes_count,
    dislikes: row.sum_dislikes_count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: ReactionsByTimeResponse['data']['attributes'][0],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution,
  total: ReactionsByTimeResponse['data']['attributes'][1]
): TimeSeries | null => {
  const timeSeries = _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );

  if (
    !timeSeries ||
    timeSeries.length === 0 ||
    typeof total[0]?.sum_reactions_count !== 'number'
  ) {
    return null;
  }

  return calculateCumulativeSerie(
    timeSeries,
    total[0]?.sum_reactions_count,
    (row: TimeSeriesRow) => row.likes + row.dislikes
  );
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
