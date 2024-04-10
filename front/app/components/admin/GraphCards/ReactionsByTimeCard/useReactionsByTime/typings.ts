import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

export interface TimeSeriesResponseRow extends ReactionsCountRow {
  first_dimension_date_created_date: string;
}

export interface ReactionsCountRow {
  count_reaction_id: number;
}

// Hook return value
export interface SingleTimeSeriesRow {
  date: string;
  reactions: number;
}

export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  likes: number;
  dislikes: number;
  total: number;
}

export type TimeSeries = TimeSeriesRow[];
