import { Moment } from 'moment';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
}

// Response
export interface Response {
  data: [TrafficSourcesRow[], ReferrerRow[]];
}

export interface TrafficSourcesRow {
  count: number;
  'dimension_referrer_type.id': string;
  first_dimension_referrer_type_name: ReferrerTypeName;
}

export type ReferrerTypeName =
  | 'Direct Entry'
  | 'Social Networks'
  | 'Search Engines'
  | 'Websites'
  | 'Campaigns';

interface ReferrerRow {
  count: number;
  count_visitor_id: number;
  'dimension_referrer_type.name': ReferrerTypeName;
  referrer_name: string | null;
}

// Hook return value
export interface PieRow {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface TableRow {
  visits: number;
  visitors: number;
  referrerType: string;
  referrerName: string;
}
