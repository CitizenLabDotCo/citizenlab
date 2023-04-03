import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export type Response = {
  data: [TimeSeriesResponse | [], [CommentsCountRow] | []];
};

type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow extends CommentsCountRow {
  first_dimension_date_created_date: string;
}

interface CommentsCountRow {
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
