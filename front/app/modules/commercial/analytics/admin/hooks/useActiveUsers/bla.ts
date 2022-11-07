// With simple strings
type Period = 'month' | 'week' | 'date';

type ColumnName<
  Prefix extends string,
  Period extends 'month' | 'week' | 'date'
> = `${Prefix}.${Period}`;

type Month<Prefix extends string> = ColumnName<Prefix, 'month'>;
type Week<Prefix extends string> = ColumnName<Prefix, 'week'>;
type Day<Prefix extends string> = ColumnName<Prefix, 'date'>;

type TimeSeriesRow<
  PeriodColumnName extends string,
  OtherColumns extends object
> = OtherColumns & {
  [K in PeriodColumnName]: string;
};

type MonthRow<Prefix extends string> = { [K in Month<Prefix>]: string };
type WeekRow<Prefix extends string> = { [K in Week<Prefix>]: string };
type DayRow<Prefix extends string> = { [K in Day<Prefix>]: string };

const isMonth = <Prefix extends string>(
  object: MonthRow<Prefix> | WeekRow<Prefix> | DayRow<Prefix>,
  prefix: Prefix
): object is MonthRow<Prefix> => {
  const monthColumn: Month<Prefix> = `${prefix}.month`;
  return monthColumn in object;
};

const isWeek = <Prefix extends string>(
  object: MonthRow<Prefix> | WeekRow<Prefix> | DayRow<Prefix>,
  prefix: Prefix
): object is WeekRow<Prefix> => {
  const weekColumn: Week<Prefix> = `${prefix}.week`;
  return weekColumn in object;
};

const getObj = <Prefix extends string>(
  object: MonthRow<Prefix> | WeekRow<Prefix> | DayRow<Prefix>,
  prefix: Prefix
): Period => {
  if (isMonth(object, prefix)) {
    return 'month';
  }

  if (isWeek(object, prefix)) {
    return 'week';
  }

  return 'date';
};
