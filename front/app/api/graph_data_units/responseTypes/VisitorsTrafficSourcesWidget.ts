interface TrafficSourcesRow {
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

export interface VisitorsTrafficSourcesResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: TrafficSourcesRow[];
  };
}
