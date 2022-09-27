import moment, { Moment } from 'moment';
import { getDate, getFirstDateInData, getLastDateInData } from './utils';
import { range } from 'lodash-es';
import { TimeSeriesResponse } from '../typings';

const parseMonths = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
): any => {
  const firstDateInData = getFirstDateInData(responseTimeSeries);
  const lastDateInData = getLastDateInData(responseTimeSeries);

  const emptyMonthsBefore = startAtMoment
    ? getEmptyMonthsBefore(startAtMoment, firstDateInData)
    : []

  const emptyMonthsAfter = endAtMoment
    ? getEmptyMonthsAfter(endAtMoment, lastDateInData)
    : []

  const parsedTimeSeries = parseTimeSeries(responseTimeSeries);

  return [
    ...emptyMonthsBefore,
    ...parsedTimeSeries,
    ...emptyMonthsAfter
  ]
}

export default parseMonths;

export const getEmptyMonthsBefore = (startAtMoment: Moment, firstDateInData: Moment) => {
  if (startAtMoment.isSameOrAfter(firstDateInData)) return [];

  const startMonth = startAtMoment.month() + 1;
  const startYear = startAtMoment.year();
  const firstMonthInData = firstDateInData.month() + 1;
  const firstYearInData = firstDateInData.year();

  if (startYear === firstYearInData) {
    return createEmptyMonths(startMonth, firstMonthInData, startYear)
  }

  return range(startYear, firstYearInData + 1).reduce((acc, year) => {
    if (year === startYear) {
      return createEmptyMonths(startMonth, 13, year)
    }

    if (year === firstYearInData) {
      return [
        ...acc,
        ...createEmptyMonths(1, firstMonthInData, year)
      ]
    }

    return [...acc, ...createEmptyMonths(1, 13, year)]
  }, [])
}

export const getEmptyMonthsAfter = (endAtMoment: Moment, lastDateInData: Moment) => {
  if (lastDateInData.isSameOrAfter(endAtMoment)) return [];

  const endMonth = endAtMoment.month() + 1;
  const endYear = endAtMoment.year();
  const lastMonthInData = lastDateInData.month() + 1;
  const lastYearInData = lastDateInData.year();

  if (endYear === lastYearInData) {
    return createEmptyMonths(lastMonthInData + 1, endMonth + 1, endYear)
  }

  return range(lastYearInData, endYear + 1).reduce((acc, year) => {
    if (year === lastYearInData) {
      return createEmptyMonths(lastMonthInData + 1, 13, year)
    }

    if (year === endYear) {
      return [
        ...acc,
        ...createEmptyMonths(1, endMonth + 1, year)
      ]
    }

    return [...acc, ...createEmptyMonths(1, 13, year)];
  }, [])
}

const createEmptyMonths = (startMonth: number, endMonth: number, year: number) =>
  range(startMonth, endMonth).map((month) => ({
    visitors: 0,
    visits: 0,
    date: getFirstDayOfMonth(year, month)
  }))

export const getFirstDayOfMonth = (year: number, month: number) => {
  return `${year}-${month < 10 ? `0${month}` : month}-01`
}

const parseTimeSeries = (responseTimeSeries: TimeSeriesResponse) => {
  const timeSeriesWithMoments = responseTimeSeries.map((row) => ({
    moment: moment(getDate(row)),
    visitors: row.count_visitor_id,
    visits: row.count
  }))

  const sortedTimeSeries = timeSeriesWithMoments.sort(momentAscending)

  return sortedTimeSeries.map(({ moment, visitors, visits }) => ({
    date: moment.format('YYYY-MM-DD'),
    visits,
    visitors
  }));
}

interface TimeSeriesWithMomentsRow {
  moment: Moment;
  visitors: number;
  visits: number;
}

const momentAscending = (
  a: TimeSeriesWithMomentsRow,
  b: TimeSeriesWithMomentsRow
) => a.moment.isBefore(b.moment) ? -1 : 1