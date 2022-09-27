import parseMonths from './parseMonths';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';
import {
  Response,
  Stats,
  TimeSeries,
  TimeSeriesResponse,
} from '../typings';

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
  if (resolution === 'month') {
    return parseMonths(
      responseTimeSeries,
      startAtMoment,
      endAtMoment
    )
  }

  if (resolution === 'week') {
    return parseWeeks(
      responseTimeSeries,
      startAtMoment,
      endAtMoment
    )
  }

  return parseDays(
    responseTimeSeries,
    startAtMoment,
    endAtMoment
  )
}

const parseWeeks = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
): any => {
  // const firstDateInData = getFirstDateInData(responseTimeSeries);
  // const lastDateInData = getLastDateInData(responseTimeSeries);

  console.log(responseTimeSeries, startAtMoment, endAtMoment)
  return []
}

const parseDays = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
): any => {
  // const firstDateInData = getFirstDateInData(responseTimeSeries);
  // const lastDateInData = getLastDateInData(responseTimeSeries);

  console.log(responseTimeSeries, startAtMoment, endAtMoment)
  return []
}
