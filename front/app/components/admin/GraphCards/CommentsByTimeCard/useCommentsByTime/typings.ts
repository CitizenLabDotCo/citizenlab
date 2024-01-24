import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

export interface TimeSeriesResponseRow extends CommentsCountRow {
  first_dimension_date_created_date: string;
}

export interface CommentsCountRow {
  count: number;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  comments: number;
  total: number;
}

export type TimeSeries = TimeSeriesRow[];
