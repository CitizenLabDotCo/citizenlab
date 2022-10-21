import moment, { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

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

export const dateRange = (start: Moment, end: Moment, step: IResolution) => {
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
