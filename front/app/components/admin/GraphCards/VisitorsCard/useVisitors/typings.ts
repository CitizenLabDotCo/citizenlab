import { ProjectId, Dates, Resolution, Stat } from '../../typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export type Response = {
  data: {
    type: 'analytics';
    attributes: [TimeSeriesResponse | [], [TotalsRow] | [], [TotalsRow] | []];
  };
};

interface BaseRow {
  count: number;
  count_visitor_id: number;
}

interface TotalsRow extends BaseRow {
  avg_duration: string | null;
  avg_pages_visited: string | null;
}

export type TimeSeriesResponse = TimeSeriesResponseRow[];
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

export interface Stats {
  visitors: Stat;
  visits: Stat;
  visitDuration: Stat;
  pageViews: Stat;
}
