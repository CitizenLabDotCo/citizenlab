import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export type Response = {
  data: [TimeSeriesResponse | [], [VotesCountRow] | []];
};

type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow {
  first_dimension_date_created_date: string;
  sum_downvotes_count: number;
  sum_upvotes_count: number;
}

interface VotesCountRow {
  sum_votes_count: number;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  upvotes: number;
  downvotes: number;
  total: number;
}

export type TimeSeries = TimeSeriesRow[];
