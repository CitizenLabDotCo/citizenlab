import { ProjectId, Dates, Resolution, Stat } from '../../typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export interface Response {
  data: [
    TimeSeriesResponse | [],
    [ActiveUsersRow],
    [ActiveUsersRow],
    [VisitorsRow],
    [VisitorsRow]
  ];
}

type TimeSeriesResponse = TimeSeriesResponseRow[];

export type TimeSeriesResponseRow =
  | TimeSeriesResponseMonth
  | TimeSeriesResponseWeek
  | TimeSeriesResponseDay;

interface ActiveUsersRow {
  count_dimension_user_id: number;
}

interface TimeSeriesResponseMonth extends ActiveUsersRow {
  'dimension_date_created.month': string;
}

interface TimeSeriesResponseWeek extends ActiveUsersRow {
  'dimension_date_created.week': string;
}

interface TimeSeriesResponseDay extends ActiveUsersRow {
  'dimension_date_created.date': string;
}

interface VisitorsRow {
  count_visitor_id: number;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  activeUsers: number;
}

export type TimeSeries = TimeSeriesRow[];

export interface Stats {
  activeUsers: Stat;
  conversionRate: Stat;
}
