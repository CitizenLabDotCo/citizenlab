import {
  ProjectId,
  Dates,
  Resolution,
  Stat,
  GetTimeSeriesResponse,
} from '../../typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export type Response = {
  data: [[TotalsRow] | [], [TotalsRow] | [], TimeSeriesResponse | []];
};

interface BaseRow {
  count: number;
  count_visitor_id: number;
}

interface TotalsRow extends BaseRow {
  avg_duration: string | null;
  avg_pages_visited: string | null;
}

type Prefix = 'dimension_date_last_action';
export type TimeSeriesResponse = GetTimeSeriesResponse<Prefix, BaseRow>;
export type TimeSeriesResponseRow = TimeSeriesResponse[number];

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
