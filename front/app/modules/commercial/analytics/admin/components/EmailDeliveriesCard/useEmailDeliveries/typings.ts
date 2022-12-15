import { Dates, Resolution } from '../../../typings';

export type QueryParameters = Dates & Resolution;

// Response
export type Response = {
  data: [
    [StatRow] | [],
    [StatRow] | [],
    [StatRow] | [],
    TimeSeriesResponse | []
  ];
};

export interface BaseRow {
  count: number;
  automated: boolean;
}

interface StatRow {
  count: string | null;
  count_campaign_id?: string | null;
}

export type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow extends BaseRow {
  first_dimension_date_sent_date: string;
}

interface PreparedBaseRow {
  automated: number;
  custom: number;
}

export type PreparedTimeSeriesResponse = PreparedTimeSeriesResponseRow[];
export interface PreparedTimeSeriesResponseRow extends PreparedBaseRow {
  first_dimension_date_sent_date: string;
}

// Hook return value
export interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  automated: number;
  custom: number;
}

export type TimeSeries = TimeSeriesRow[];

export interface Stats {
  total: string | null | undefined;
  custom: string | null | undefined;
  customCampaigns: string | null | undefined;
  automated: string | null | undefined;
  automatedCampaigns: string | null | undefined;
}
