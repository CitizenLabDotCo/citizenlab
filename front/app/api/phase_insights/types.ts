export interface PhaseInsightsParticipationMetrics {
  visitors: number;
  participants: number;
  engagement_rate: number;
  // Method-specific metrics
  ideas?: number;
  comments?: number;
  reactions?: number;
  votes?: number;
  submissions?: number;
  votes_per_person?: number;
  completion_rate?: number;
  // Time comparison (for "Last week" deltas)
  visitors_change?: number;
  participants_change?: number;
  ideas_change?: number;
  comments_change?: number;
  reactions_change?: number;
  votes_change?: number;
  submissions_change?: number;
}

export interface DemographicDataPoint {
  key: string;
  label: string;
  count: number;
  percentage: number;
  // For representativeness comparison
  population_percentage?: number;
}

export interface DemographicField {
  field_id: string;
  field_key: string;
  field_name: string;
  field_code?: string | null;
  data_points: DemographicDataPoint[];
  r_score?: number; // Representativeness score (0-100)
}

export interface PhaseInsightsDemographics {
  fields: DemographicField[];
}
