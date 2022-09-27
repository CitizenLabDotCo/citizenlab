import { getFirstDateInData, getLastDateInData } from './utils';
import { range } from 'lodash-es';
import { TimeSeriesResponse, TimeSeries } from '../typings';
import { Moment } from 'moment';

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

  console.log(responseTimeSeries, endAtMoment, emptyMonthsBefore, emptyMonthsAfter)
  return []
}

export default parseMonths;

export const getEmptyMonthsBefore = (startAtMoment: Moment, firstDateInData: Moment): TimeSeries => {
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

export const getEmptyMonthsAfter = (endAtMoment: Moment, lastDateInData: Moment): TimeSeries => {
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
  return `${year}-${month < 11 ? `0${month}` : month}-01`
}