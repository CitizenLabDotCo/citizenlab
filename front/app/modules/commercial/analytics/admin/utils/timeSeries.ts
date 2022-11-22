import moment, { Moment } from 'moment';

// utils
import { get } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { MonthRow, WeekRow, DateRow, DateColumn } from '../typings';

export const timeSeriesParser =
  <Row, ParsedRow>(
    getDate: (row: Row) => Moment,
    parseRow: (date: Moment, row?: Row) => ParsedRow
  ) =>
  (
    timeSeries: Row[],
    startAtMoment: Moment | null | undefined,
    endAtMoment: Moment | null,
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
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  getDate: (row: Row) => Moment,
  parseRow: (date: Moment, row?: Row) => ParsedRow
): ParsedRow[] | null => {
  const indexedTimeSeries = indexTimeSeries(timeSeries, getDate);

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
    const currentMonthStr = month.format('YYYY-MM-DD');
    const row = indexedTimeSeries.get(currentMonthStr);

    return parseRow(month, row);
  });
};

export const parseWeeks = <Row, ParsedRow>(
  timeSeries: Row[],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  getDate: (row: Row) => Moment,
  parseRow: (date: Moment, row?: Row) => ParsedRow
): ParsedRow[] | null => {
  const indexedTimeSeries = indexTimeSeries(timeSeries, getDate);

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
    const currentMondayStr = monday.format('YYYY-MM-DD');
    const row = indexedTimeSeries.get(currentMondayStr);

    return parseRow(monday, row);
  });
};

export const parseDays = <Row, ParsedRow>(
  timeSeries: Row[],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  getDate: (row: Row) => Moment,
  parseRow: (date: Moment, row?: Row) => ParsedRow
): ParsedRow[] | null => {
  const indexedTimeSeries = indexTimeSeries(timeSeries, getDate);

  const firstDateInData = getFirstDateInData(timeSeries, getDate);
  const lastDateInData = getLastDateInData(timeSeries, getDate);

  const startDay = startAtMoment ?? firstDateInData;
  const endDay = endAtMoment ?? lastDateInData;

  const days = dateRange(startDay, endDay, 'day');
  if (days === null) return null;

  return days.map((day) => {
    const currentDayStr = day.format('YYYY-MM-DD');
    const row = indexedTimeSeries.get(currentDayStr);

    return parseRow(day, row);
  });
};

export const dateGetter =
  <Prefix extends string>(prefix: Prefix) =>
  (row: DateRow<Prefix>) =>
    getDate(row, prefix);

const getDate = <Prefix extends string>(
  row: DateRow<Prefix>,
  prefix: Prefix
) => {
  const monthColumn: DateColumn<Prefix, 'month'> = `${prefix}.month`;
  if (isMonth(row, monthColumn)) return moment(get(row, monthColumn));

  const weekColumn: DateColumn<Prefix, 'week'> = `${prefix}.week`;
  if (isWeek(row, weekColumn)) return moment(get(row, weekColumn));

  const dayColumn: DateColumn<Prefix, 'date'> = `${prefix}.date`;
  return moment(get(row, dayColumn));
};

export const isMonth = <Prefix extends string>(
  row: DateRow<Prefix>,
  columnName: `${Prefix}.month`
): row is MonthRow<Prefix> => {
  return columnName in row;
};

export const isWeek = <Prefix extends string>(
  row: DateRow<Prefix>,
  columnName: `${Prefix}.week`
): row is WeekRow<Prefix> => {
  return columnName in row;
};

const roundDownToFirstDayOfMonth = (date: Moment) => {
  return moment(`${date.format('YYYY-MM')}-01`);
};

const roundDownToMonday = (date: Moment) => {
  const dayNumber = date.isoWeekday();
  return date.clone().subtract({ day: dayNumber - 1 });
};

export const roundDateToMidnight = (date: Moment) => {
  return moment(date.format('YYYY-MM-DD'));
};

export const indexTimeSeries = <Row>(
  responseTimeSeries: Row[],
  getDate: (row: Row) => Moment
): Map<string, Row> => {
  return responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    acc.set(date.format('YYYY-MM-DD'), row);

    return acc;
  }, new Map<string, Row>());
};

export const getFirstDateInData = <Row>(
  responseTimeSeries: Row[],
  getDate: (row: Row) => Moment
) => {
  const firstMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    return date.isAfter(acc) ? acc : date;
  }, moment());

  return firstMonthInData;
};

export const getLastDateInData = <Row>(
  responseTimeSeries: Row[],
  getDate: (row: Row) => Moment
) => {
  const lastMonthInData = responseTimeSeries.reduce((acc, row) => {
    const date = getDate(row);
    return date.isAfter(acc) ? date : acc;
  }, moment('1970-01-01'));

  return lastMonthInData;
};

type TimeDelta = { month: 1 } | { day: 7 } | { day: 1 };

const TIME_DELTA_MAP: Record<IResolution, TimeDelta> = {
  month: { month: 1 },
  week: { day: 7 },
  day: { day: 1 },
};

const dateRange = (start: Moment, end: Moment, step: IResolution) => {
  const timeDelta = TIME_DELTA_MAP[step];
  const dates: Moment[] = [];

  let currentDate = start.clone();

  // Should not be possible, but just in case to avoid
  // infinite loop
  if (start.isAfter(end)) return null;

  while (currentDate.isSameOrBefore(end)) {
    dates.push(currentDate.clone());
    currentDate = currentDate.add(timeDelta);
  }

  return dates;
};

export const emptyDateRange = <Row>(
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution,
  getEmptyRow: (date: Moment, index: number) => Row
): Row[] => {
  const start = startAtMoment ?? moment().subtract({ month: 7 });
  const end = endAtMoment ?? moment();

  const dates = dateRange(start, end, resolution);
  if (dates === null) return [];

  return dates.map(getEmptyRow);
};
