import {
  Dates,
  Resolution,
  // Stat,
  GetTimeSeriesResponse,
} from '../../typings';

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

type Prefix = 'dimension_date_sent';
export type TimeSeriesResponse = GetTimeSeriesResponse<Prefix, BaseRow>;
export type TimeSeriesResponseRow = TimeSeriesResponse[number];

interface PreparedBaseRow {
  automated: number;
  custom: number;
}

export type PreparedTimeSeriesResponse = GetTimeSeriesResponse<
  Prefix,
  PreparedBaseRow
>;
export type PreparedTimeSeriesResponseRow = PreparedTimeSeriesResponse[number];

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
