import {
  ProjectId,
  Dates,
  Resolution,
  Stat,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export interface Response {
  data: [
    TimeSeriesResponse | [],
    [ActiveUsersRow] | [],
    [ActiveUsersRow] | [],
    [VisitorsRow] | [],
    [VisitorsRow] | []
  ];
}

type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow extends ActiveUsersRow {
  first_dimension_date_created_date: string;
}

interface ActiveUsersRow {
  count_dimension_user_id: number;
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
  participationRate: Stat;
}
