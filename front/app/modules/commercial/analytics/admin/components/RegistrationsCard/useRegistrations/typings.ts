import { Dates, Resolution, Stat } from 'components/admin/GraphCards/typings';

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

type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow extends RegistrationsCountRow {
  first_dimension_date_registration_date: string;
}

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
