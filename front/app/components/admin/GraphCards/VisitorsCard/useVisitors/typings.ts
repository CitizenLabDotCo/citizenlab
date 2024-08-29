import { Dates, Resolution, Stat } from '../../typings';

export type QueryParameters = Dates & Resolution;

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
