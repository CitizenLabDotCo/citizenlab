import { Dates, Resolution } from 'components/admin/GraphCards/typings';

export type QueryParameters = Dates & Resolution;

// Response
export type Response = {
  data: [TimeSeriesResponse | [], RegistrationsTotalRow[] | []];
};

type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow {
  first_dimension_date_registration_date: string;
  count: number;
}

export interface RegistrationsTotalRow {
  'dimension_date_registration.date': string;
  count: number;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  registrations: number;
  total: number;
}

export type TimeSeries = TimeSeriesRow[];
