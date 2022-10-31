import { Dates, Resolution } from '../../typings';
import { Stat } from '../../typings';

export type QueryParameters = Dates & Resolution;

// Response
export type Response = {
  data: [
    TimeSeriesResponseRow[],
    [RegistrationsCountRow],
    [RegistrationsCountRow],
    [VisitorsCountRow],
    [VisitorsCountRow]
  ];
};

export type TimeSeriesResponseRow =
  | TimeSeriesResponseMonth
  | TimeSeriesResponseWeek
  | TimeSeriesResponseDay;

interface TimeSeriesResponseMonth extends BaseTimeSeriesResponseRow {
  'dimension_date_registration.month': string;
}

interface TimeSeriesResponseWeek extends BaseTimeSeriesResponseRow {
  'dimension_date_registration.week': string;
}

interface TimeSeriesResponseDay extends BaseTimeSeriesResponseRow {
  'dimension_date_registration.date': string;
}

interface BaseTimeSeriesResponseRow {
  count: number;
}

interface RegistrationsCountRow {
  count: number;
}

interface VisitorsCountRow {
  count_visitor_id: number;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  registrations: number;
}

export type TimeSeries = TimeSeriesRow[];

export interface Stats {
  registrations: Stat;
  conversionRate: Stat;
}
