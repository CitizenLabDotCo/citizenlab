import {
  Dates,
  ProjectId,
  Resolution,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = Dates & Resolution & ProjectId;

// Response
export type Response = {
  data: {
    type: 'analytics';
    attributes: [
      [StatRow] | [],
      [StatRow] | [],
      [StatRow] | [],
      TimeSeriesResponse | []
    ];
  };
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
  first_dimension_date_sent_date?: string;
  first_dimension_date_sent_week?: string;
  first_dimension_date_sent_month?: string;
}

interface PreparedBaseRow {
  automated: number;
  custom: number;
}

export type PreparedTimeSeriesResponse = PreparedTimeSeriesResponseRow[];
export interface PreparedTimeSeriesResponseRow extends PreparedBaseRow {
  first_dimension_date_sent_date?: string;
  first_dimension_date_sent_week?: string;
  first_dimension_date_sent_month?: string;
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
