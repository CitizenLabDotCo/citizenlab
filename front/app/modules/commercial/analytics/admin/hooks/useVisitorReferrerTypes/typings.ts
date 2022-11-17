import { ProjectId, Dates } from '../../typings';

export type QueryParameters = ProjectId & Dates;

// Response
export interface Response {
  data: TrafficSourcesRow[];
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

// Hook return value
export interface PieRow {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
