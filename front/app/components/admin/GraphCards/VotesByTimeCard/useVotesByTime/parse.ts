import moment, { Moment } from 'moment';

// utils
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { get } from 'utils/helperUtils';
import { orderBy } from 'lodash-es';

// typings
import {
  Response,
  TimeSeriesResponseRow,
  TimeSeries,
  TimeSeriesRow,
} from './typings';
import { Translations } from './translations';
import { IResolution } from 'components/admin/ResolutionControl';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  upvotes: 0,
  downvotes: 0,
  total: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    total: 0,
    upvotes: row.sum_upvotes_count,
    downvotes: row.sum_downvotes_count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: Response['data'][0],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution,
  total: Response['data'][1]
): TimeSeries | null => {
  let timeSeries = _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
  if (!timeSeries) return [];
  let totalCount = total && total.length > 0 ? total[0]?.sum_votes_count : 0;
  timeSeries = orderBy(
    timeSeries,
    (o: TimeSeriesRow) => {
      return moment(o.date).format('YYYYMMDD');
    },
    ['desc']
  )
    .map((row) => {
      const _totalCount = totalCount;
      totalCount = (totalCount || 0) - row.upvotes - row.downvotes;
      return {
        ...row,
        total: _totalCount || 0,
      };
    })
    .reverse();
  return timeSeries;
};

export const parseExcelData = (
  timeSeries: TimeSeries | null,
  translations: Translations
) => {
  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.date]: row.date,
    [translations.upvotes]: row.upvotes,
    [translations.downvotes]: row.downvotes,
  }));

  return {
    [translations.timeSeries]: timeSeriesData ?? [],
  };
};

const formatSerieChange = (serieChange: number) => {
  if (serieChange > 0) {
    return `(+${serieChange.toString()})`;
  } else if (serieChange < 0) {
    return `(${serieChange.toString()})`;
  }
  return null;
};

export const getFormattedNumbers = (serie) => {
  if (serie) {
    const firstSerieValue = serie.length > 0 ? serie[0].total : 0;
    const lastSerieValue = serie.length > 0 ? serie[serie.length - 1].total : 0;
    const firstSerieBar =
      serie.length > 0 ? serie[0].upvotes + serie[0].downvotes : 0;
    const serieChange = lastSerieValue - firstSerieValue + firstSerieBar;
    let typeOfChange: 'increase' | 'decrease' | '' = '';

    if (serieChange > 0) {
      typeOfChange = 'increase';
    } else if (serieChange < 0) {
      typeOfChange = 'decrease';
    }

    return {
      typeOfChange,
      totalNumber: lastSerieValue,
      formattedSerieChange: formatSerieChange(serieChange),
    };
  }

  return {
    totalNumber: null,
    formattedSerieChange: null,
    typeOfChange: '',
  };
};
