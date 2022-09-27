import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
}

// Response
export type Response = {
  data: [[TotalsRow], [TotalsRow], TimeSeriesResponse];
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

export type TimeSeriesResponseRow = (
  | TimeSeriesResponseMonth
  | TimeSeriesResponseWeek
  | TimeSeriesResponseDay
)

interface TimeSeriesResponseMonth extends BaseRow {
  'dimension_date_last_action.month': string;
}

interface TimeSeriesResponseWeek extends BaseRow {
  'dimension_date_last_action.week': string;
}

interface TimeSeriesResponseDay extends BaseRow {
  'dimension_date_last_action.date': string;
}

// Hook return value
interface Stat {
  value: string;
  lastPeriod: string;
}

export interface Stats {
  visitors: Stat;
  visits: Stat;
  visitDuration: Stat;
  pageViews: Stat;
}

export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  visits: number;
  visitors: number;
}

export type TimeSeries = TimeSeriesRow[];
