import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

export interface TimeSeriesResponseRow extends ActiveUsersRow {
  first_dimension_date_created_date: string;
}

export interface ActiveUsersRow {
  count_dimension_user_id: number;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  activeUsers: number;
}

export type TimeSeries = TimeSeriesRow[];
