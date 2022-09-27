import moment, { Moment } from 'moment';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import {
  Response,
  Stats,
  TimeSeries,
  TimeSeriesResponse,
  TimeSeriesResponseRow
} from './typings';

export const parseStats = ([
  totalsWholePeriodRows,
  totalsLastPeriodRows,
]: Response['data']): Stats => {
  const wholePeriod = totalsWholePeriodRows[0];
  const lastPeriod = totalsLastPeriodRows[0];

  return {
    visitors: {
      value: wholePeriod.count_visitor_id.toLocaleString(),
      lastPeriod: lastPeriod.count_visitor_id.toLocaleString(),
    },
    visits: {
      value: wholePeriod.count.toLocaleString(),
      lastPeriod: lastPeriod.count.toLocaleString(),
    },
    visitDuration: {
      value: wholePeriod.avg_duration ?? '-',
      lastPeriod: lastPeriod.avg_duration ?? '-',
    },
    pageViews: {
      value: wholePeriod.avg_pages_visited ?? '-',
      lastPeriod: lastPeriod.avg_pages_visited ?? '-',
    },
  };
};

export const parseTimeSeries = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
): TimeSeries => {
  const firstDate = getFirstDate(responseTimeSeries)
  const lastDate = getLastDate(responseTimeSeries)

  if (resolution === 'month') {
    return interpolateMonths(
      responseTimeSeries,
      startAtMoment,
      endAtMoment,
      firstDate,
      lastDate
    )
  }

  if (resolution === 'week') {
    return interpolateWeeks(
      responseTimeSeries,
      startAtMoment,
      endAtMoment,
      firstDate,
      lastDate
    )
  }

  return interpolateDays(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    firstDate,
    lastDate
  )
}

const getFirstDate = (responseTimeSeries: TimeSeriesResponse) => {
  const firstMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row)
    return date.isAfter(acc) ? acc : date
  }, moment());

  return firstMonthInData;
}

const getLastDate = (responseTimeSeries: TimeSeriesResponse) => {
  const lastMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row)
    return date.isAfter(acc) ? date : acc
  }, moment());

  return lastMonthInData;
}

const getDate = (row: TimeSeriesResponseRow) => {
  if ('dimension_date_last_action.month' in row) {
    return moment(row['dimension_date_last_action.month'])
  }

  if ('dimension_date_last_action.week' in row) {
    return moment(row['dimension_date_last_action.week'])
  }

  return moment(row['dimension_date_last_action.date']);
}

const interpolateMonths = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  firstDate: Moment,
  lastDate: Moment
): any => {
  console.log(responseTimeSeries, startAtMoment, endAtMoment, firstDate, lastDate)
  return []
}

const interpolateWeeks = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  firstDate: Moment,
  lastDate: Moment
): any => {
  console.log(responseTimeSeries, startAtMoment, endAtMoment, firstDate, lastDate)
  return []
}

const interpolateDays = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  firstDate: Moment,
  lastDate: Moment
): any => {
  console.log(responseTimeSeries, startAtMoment, endAtMoment, firstDate, lastDate)
  return []
}