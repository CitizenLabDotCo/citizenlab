import moment, { Moment } from 'moment';

// utils
import {
  timeSeriesParser,
  calculateCumulativeSerie,
} from 'components/admin/GraphCards/_utils/timeSeries';
import { get } from 'utils/helperUtils';
import { sumBy } from 'lodash-es';

// typings
import {
  Response,
  TimeSeriesResponseRow,
  TimeSeries,
  TimeSeriesRow,
  RegistrationsTotalRow,
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
  const timeSeries = _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );

  if (
    !timeSeries ||
    timeSeries.length === 0 ||
    total.some((t: RegistrationsTotalRow) => typeof t.count !== 'number')
  ) {
    return null;
  }

  return calculateCumulativeSerie(
    timeSeries,
    sumBy(total, (t: RegistrationsTotalRow) => t.count),
    (row: TimeSeriesRow) => row.registrations
  );
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
