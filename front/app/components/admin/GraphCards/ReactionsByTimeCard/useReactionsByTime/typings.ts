import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export type Response = {
  data: {
    type: 'report_builder_data_units';
    attributes: [TimeSeriesResponse | [], [ReactionsCountRow] | []];
  };
};

type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow {
  first_dimension_date_created_date: string;
  sum_dislikes_count: number;
  sum_likes_count: number;
}

interface ReactionsCountRow {
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
