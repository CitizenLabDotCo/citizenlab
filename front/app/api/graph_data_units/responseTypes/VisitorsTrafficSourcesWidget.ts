type ReferrerType =
  | 'direct_entry'
  | 'search_engine'
  | 'social_network'
  | 'sso_redirect'
  | 'other';

export interface VisitorsTrafficSourcesResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      sessions_per_referrer_type: Record<ReferrerType, number>;
      top_50_referrers: {
        referrer: string;
        visits: number;
        visitors: number;
        referrer_type: ReferrerType;
      }[];
    };
  };
}
