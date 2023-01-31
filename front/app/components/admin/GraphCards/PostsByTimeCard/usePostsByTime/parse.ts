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
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  inputs: 0,
  total: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    total: 0,
    inputs: row.count,
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
  let totalCount = total[0]?.count;

  timeSeries = orderBy(
    timeSeries,
    (o: TimeSeriesRow) => {
      return moment(o.date).format('YYYYMMDD');
    },
    ['desc']
  )
    .map((row) => {
      const _totalCount = totalCount;
      totalCount = (totalCount || 0) - row.inputs;
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
    [translations.inputs]: row.inputs,
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

export const getFormattedNumbers = (
  serie: TimeSeries | NilOrError
): {
  typeOfChange: 'increase' | 'decrease' | null;
  totalNumber: number | null;
  formattedSerieChange: string | null;
} => {
  if (!isNilOrError(serie)) {
    const firstSerieValue = serie && serie[0].total;
    const lastSerieValue = serie && serie[serie.length - 1].total;
    const serieChange = lastSerieValue - firstSerieValue;
    let typeOfChange: 'increase' | 'decrease' | null = null;

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
    typeOfChange: null,
  };
};
