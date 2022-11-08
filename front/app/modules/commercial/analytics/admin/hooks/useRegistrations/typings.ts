import { Dates, Resolution, Stat, GetTimeSeriesResponse } from '../../typings';

export type QueryParameters = Dates & Resolution;

// Response
export type Response = {
  data: [
    TimeSeriesResponse | [],
    [RegistrationsCountRow] | [],
    [RegistrationsCountRow] | [],
    [VisitorsCountRow] | [],
    [VisitorsCountRow] | []
  ];
};

type Prefix = 'dimension_date_registration';

type TimeSeriesResponse = GetTimeSeriesResponse<Prefix, { count: number }>;
export type TimeSeriesResponseRow = TimeSeriesResponse[number];

interface RegistrationsCountRow {
  count: number;
}

interface VisitorsCountRow {
  count_visitor_id: number;
}

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
