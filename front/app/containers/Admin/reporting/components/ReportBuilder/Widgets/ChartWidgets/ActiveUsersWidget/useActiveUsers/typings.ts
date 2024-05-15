import {
  ProjectId,
  DatesStrings,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & DatesStrings & Resolution;

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  activeUsers: number;
}

export type TimeSeries = TimeSeriesRow[];
