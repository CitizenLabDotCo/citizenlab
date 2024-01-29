import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

export interface TimeSeriesResponseRow {
  first_dimension_date_created_date: string;
  sum_dislikes_count: number;
  sum_likes_count: number;
}

export interface ReactionsCountRow {
  sum_reactions_count: number;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  likes: number;
  dislikes: number;
  total: number;
}

export type TimeSeries = TimeSeriesRow[];
