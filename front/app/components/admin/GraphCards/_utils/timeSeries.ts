import {
  addDays,
  parseISO,
  addMonths,
  format,
  isAfter,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { orderBy } from 'lodash-es';

import { IResolution } from 'components/admin/ResolutionControl';

export const timeSeriesParser =
  <Row, ParsedRow>(
    getDate: (row: Row) => Date,
    parseRow: (date: Date, row?: Row) => ParsedRow
  ) =>
  (
    timeSeries: Row[],
    startAtMoment: Date | null | undefined,
    endAtMoment: Date | null,
    resolution: IResolution
  ): ParsedRow[] | null => {
    if (timeSeries.length === 0) return null;

    const startAtMomentRounded = startAtMoment
      ? roundDateToMidnight(startAtMoment)
      : startAtMoment;

    const endAtMomentRounded = endAtMoment
      ? roundDateToMidnight(endAtMoment)
      : endAtMoment;

    if (resolution === 'month') {
      return parseMonths(
        timeSeries,
        startAtMomentRounded,
        endAtMomentRounded,
        getDate,
        parseRow
      );
    }

    if (resolution === 'week') {
      return parseWeeks(
        timeSeries,
        startAtMomentRounded,
        endAtMomentRounded,
        getDate,
        parseRow
      );
    }

    return parseDays(
      timeSeries,
      startAtMomentRounded,
      endAtMomentRounded,
      getDate,
      parseRow
    );
  };

export const parseMonths = <Row, ParsedRow>(
  timeSeries: Row[],
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null,
  getDate: (row: Row) => Date,
  parseRow: (date: Date, row?: Row) => ParsedRow
): ParsedRow[] | null => {
  const indexedTimeSeries = indexTimeSeries(timeSeries, (row) => {
    const date = getDate(row);
    return roundDownToFirstDayOfMonth(date);
  });

  const firstDateInData = getFirstDateInData(timeSeries, getDate);
  const lastDateInData = getLastDateInData(timeSeries, getDate);

  const startMonth = startAtMoment
    ? roundDownToFirstDayOfMonth(startAtMoment)
    : roundDownToFirstDayOfMonth(firstDateInData);

  const endMonth = endAtMoment
    ? roundDownToFirstDayOfMonth(endAtMoment)
    : roundDownToFirstDayOfMonth(lastDateInData);

  const months = dateRange(startMonth, endMonth, 'month');
  if (months === null) return null;

  return months.map((month) => {
    const currentMonthStr = format(month, 'yyyy-MM-dd');
    const row = indexedTimeSeries.get(currentMonthStr);

    return parseRow(month, row);
  });
};

export const parseWeeks = <Row, ParsedRow>(
  timeSeries: Row[],
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null,
  getDate: (row: Row) => Date,
  parseRow: (date: Date, row?: Row) => ParsedRow
): ParsedRow[] | null => {
  const indexedTimeSeries = indexTimeSeries(timeSeries, (row) => {
    const date = getDate(row);
    return roundDownToMonday(date);
  });

  const firstDateInData = getFirstDateInData(timeSeries, getDate);
  const lastDateInData = getLastDateInData(timeSeries, getDate);

  const startMonday = startAtMoment
    ? roundDownToMonday(startAtMoment)
    : roundDownToMonday(firstDateInData);

  const endMonday = endAtMoment
    ? roundDownToMonday(endAtMoment)
    : roundDownToMonday(lastDateInData);

  const mondays = dateRange(startMonday, endMonday, 'week');
  if (mondays === null) return null;

  return mondays.map((monday) => {
    const currentMondayStr = format(monday, 'yyyy-MM-dd');
    const row = indexedTimeSeries.get(currentMondayStr);

    return parseRow(monday, row);
  });
};

export const parseDays = <Row, ParsedRow>(
  timeSeries: Row[],
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null,
  getDate: (row: Row) => Date,
  parseRow: (date: Date, row?: Row) => ParsedRow
): ParsedRow[] | null => {
  const indexedTimeSeries = indexTimeSeries(timeSeries, getDate);

  const firstDateInData = getFirstDateInData(timeSeries, getDate);
  const lastDateInData = getLastDateInData(timeSeries, getDate);

  const startDay = startAtMoment ?? firstDateInData;
  const endDay = endAtMoment ?? lastDateInData;

  const days = dateRange(startDay, endDay, 'day');
  if (days === null) return null;

  return days.map((day) => {
    const currentDayStr = format(day, 'yyyy-MM-dd');
    const row = indexedTimeSeries.get(currentDayStr);

    return parseRow(day, row);
  });
};

const roundDownToFirstDayOfMonth = (date: Date) => startOfMonth(date);

// ISO weeks: Monday is the first day.
const roundDownToMonday = (date: Date) =>
  startOfWeek(date, { weekStartsOn: 1 });

export const roundDateToMidnight = (date: Date) => startOfDay(date);

const indexTimeSeries = <Row>(
  responseTimeSeries: Row[],
  getDate: (row: Row) => Date
): Map<string, Row> => {
  return responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    acc.set(format(date, 'yyyy-MM-dd'), row);

    return acc;
  }, new Map<string, Row>());
};

export const getFirstDateInData = <Row>(
  responseTimeSeries: Row[],
  getDate: (row: Row) => Date
) => {
  const firstMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    return isAfter(date, acc) ? acc : date;
  }, new Date());

  return firstMonthInData;
};

export const getLastDateInData = <Row>(
  responseTimeSeries: Row[],
  getDate: (row: Row) => Date
) => {
  const lastMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    return isAfter(date, acc) ? date : acc;
  }, new Date(0));

  return lastMonthInData;
};

const ADVANCE_BY: Record<IResolution, (date: Date) => Date> = {
  month: (date) => addMonths(date, 1),
  week: (date) => addDays(date, 7),
  day: (date) => addDays(date, 1),
};

const dateRange = (start: Date, end: Date, step: IResolution) => {
  const advance = ADVANCE_BY[step];
  const dates: Date[] = [];

  // Should not be possible, but just in case to avoid
  // infinite loop
  if (isAfter(start, end)) return null;

  let currentDate = start;
  while (!isAfter(currentDate, end)) {
    dates.push(currentDate);
    currentDate = advance(currentDate);
  }

  return dates;
};

export const emptyDateRange = <Row>(
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null | undefined,
  resolution: IResolution,
  getEmptyRow: (date: Date, index: number) => Row
): Row[] => {
  const start = startAtMoment ?? subMonths(new Date(), 7);
  const end = endAtMoment ?? new Date();

  const dates = dateRange(start, end, resolution);
  if (dates === null) return [];

  return dates.map(getEmptyRow);
};

// Calculate cumulative series by taking the total as the last item
// in the serie and substract it with each time period value
type RowWithDate = { date: string };
export function calculateCumulativeSerie<SerieRow extends RowWithDate>(
  serie: SerieRow[],
  globalTotal: number,
  getTotal: (s: SerieRow) => number
) {
  let timeSerie = orderBy(
    serie,
    (row: SerieRow) => {
      return format(parseISO(row.date), 'yyyyMMdd');
    },
    ['desc']
  );

  let totalCount = globalTotal;
  timeSerie = timeSerie
    .map((row) => {
      const _totalCount = totalCount;
      totalCount = totalCount - getTotal(row);
      return {
        ...row,
        total: _totalCount,
      };
    })
    .reverse();

  return timeSerie;
}
