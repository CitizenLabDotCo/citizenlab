import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

interface BaseRow {
  count: number;
  count_visitor_id: number;
}

export interface TotalsRow extends BaseRow {
  avg_duration: string | null;
  avg_pages_visited: string | null;
}

export interface TimeSeriesResponseRow extends BaseRow {
  first_dimension_date_first_action_date: string;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  visits: number;
  visitors: number;
}

export type TimeSeries = TimeSeriesRow[];
