import {
  ProjectId,
  Dates,
  Resolution,
  Stat,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

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
