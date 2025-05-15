type ReferrerType =
  | 'direct_entry'
  | 'search_engine'
  | 'social_network'
  | 'other';

export interface VisitorsTrafficSourcesResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      sessions_per_referrer_type: Record<ReferrerType, number>;
    };
  };
}
