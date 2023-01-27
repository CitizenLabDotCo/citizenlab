import moment, { Moment } from 'moment';

// utils
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { get } from 'utils/helperUtils';
import { sumBy } from 'lodash-es';

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
  registrations: 0,
  total: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    total: 0,
    registrations: row.count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_registration_date'));
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
  let totalCount = sumBy(total, (t) => t.count);
  timeSeries = timeSeries
    .reverse()
    .map((row) => {
      const _totalCount = totalCount;
      totalCount = (totalCount || 0) - row.registrations;
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
    [translations.registrations]: row.registrations,
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
    const firstSerieBar = serie.length > 0 ? serie[0].registrations : 0;
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
