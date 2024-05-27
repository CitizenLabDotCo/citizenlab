import { Dates, Resolution, Stat } from 'components/admin/GraphCards/typings';

export type QueryParameters = Dates & Resolution;

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  registrations: number;
}

export type TimeSeries = TimeSeriesRow[];

export interface Stats {
  registrations: Stat;
  registrationRate: Stat;
}
