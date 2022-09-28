import moment, { Moment } from 'moment';
import { getDate, getFirstDateInData, getLastDateInData } from './utils';
import { range } from 'lodash-es';
import { TimeSeriesResponse } from '../typings';

export const parseMonths = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined
) => {
  const firstDateInData = getFirstDateInData(responseTimeSeries);
  const lastDateInData = getLastDateInData(responseTimeSeries);

  const emptyMonthsBefore = startAtMoment
    ? getEmptyMonthsBefore(startAtMoment, firstDateInData)
    : [];

  const emptyMonthsAfter = endAtMoment
    ? getEmptyMonthsAfter(endAtMoment, lastDateInData)
    : [];

  const parsedTimeSeries = parseTimeSeries(responseTimeSeries);

  return [...emptyMonthsBefore, ...parsedTimeSeries, ...emptyMonthsAfter];
};

export const getEmptyMonthsBefore = (
  startAtMoment: Moment,
  firstDateInData: Moment
) => {
  const months = interpolateMonths(
    startAtMoment,
    firstDateInData.clone().subtract({ month: 1 })
  );
  if (months === null) return [];

  return months.map(createEmptyMonth);
};

export const getEmptyMonthsAfter = (
  endAtMoment: Moment,
  lastDateInData: Moment
) => {
  const months = interpolateMonths(
    lastDateInData.clone().add({ month: 1 }),
    endAtMoment
  );
  if (months === null) return [];

  return months.map(createEmptyMonth);
};

const interpolateMonths = (from: Moment, to: Moment) => {
  if (from.isAfter(to)) return null;
  if (from.isSame(to)) return [from];

  const fromMonth = from.month() + 1;
  const fromYear = from.year();
  const toMonth = to.month() + 1;
  const toYear = to.year();

  if (fromYear === toYear) return monthRange(fromMonth, toMonth + 1, fromYear);

  return range(fromYear, toYear + 1).reduce((acc, year) => {
    if (year === fromYear) {
      return monthRange(fromMonth, 13, year);
    }

    if (year === toYear) {
      return [...acc, ...monthRange(1, toMonth + 1, year)];
    }

    return [...acc, ...monthRange(1, 13, year)];
  }, []);
};

const monthRange = (from: number, to: number, year: number) => {
  return range(from, to).map((month) =>
    moment(getFirstDayOfMonth(year, month))
  );
};

const createEmptyMonth = (moment: Moment) => ({
  visitors: 0,
  visits: 0,
  date: moment.format('YYYY-MM-DD'),
});

export const getFirstDayOfMonth = (year: number, month: number) => {
  return `${year}-${month < 10 ? `0${month}` : month}-01`;
};

const parseTimeSeries = (responseTimeSeries: TimeSeriesResponse) => {
  const timeSeriesWithMoments = responseTimeSeries.map((row) => ({
    moment: moment(getDate(row)),
    visitors: row.count_visitor_id,
    visits: row.count,
  }));

  const sortedTimeSeries = timeSeriesWithMoments.sort(momentAscending);
  const timeSeriesWithoutGaps = fillGaps(sortedTimeSeries);

  return timeSeriesWithoutGaps.map(({ moment, visitors, visits }) => ({
    date: moment.format('YYYY-MM-DD'),
    visits,
    visitors,
  }));
};

interface TimeSeriesWithMomentsRow {
  moment: Moment;
  visitors: number;
  visits: number;
}

const momentAscending = (
  a: TimeSeriesWithMomentsRow,
  b: TimeSeriesWithMomentsRow
) => (a.moment.isBefore(b.moment) ? -1 : 1);

const fillGaps = (sortedTimeSeries: TimeSeriesWithMomentsRow[]) => {
  const newTimeSeries: TimeSeriesWithMomentsRow[] = [];

  for (let i = 0; i < sortedTimeSeries.length - 1; i++) {
    const thisRow = sortedTimeSeries[i]
    const nextRow = sortedTimeSeries[i + 1]

    newTimeSeries.push(thisRow);

    const monthsInBetween = interpolateMonths(
      thisRow.moment.clone().add({ month: 1 }),
      nextRow.moment.clone().subtract({ month: 1 })
    )

    if (monthsInBetween) {
      newTimeSeries.push(...monthsInBetween.map((moment) => ({
        moment,
        visitors: 0,
        visits: 0
      })))
    }

    if (i === sortedTimeSeries.length - 2) {
      newTimeSeries.push(nextRow)
    }
  }

  return newTimeSeries;
}