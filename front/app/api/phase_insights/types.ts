// ============================================================================
// PARTICIPATION METRICS TYPES
// ============================================================================

/**
 * Participation metrics attributes (nested in JSONAPI response)
 */
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

/**
 * Participation metrics data (nested in JSONAPI response)
 */
export interface PhaseInsightsParticipationMetricsData {
  id: string;
  type: 'phase_participation_metrics';
  attributes: PhaseInsightsParticipationMetrics;
}

/**
 * Participation metrics response (full JSONAPI structure)
 * This is what the API returns - hooks return this structure
 */
export interface IPhaseInsightsParticipationMetrics {
  data: PhaseInsightsParticipationMetricsData;
}

// ============================================================================
// DEMOGRAPHICS TYPES - FRONTEND FORMAT (Component Consumption)
// ============================================================================

/**
 * Individual data point for a demographic option
 * Used by components for rendering charts and visualizations
 */
export interface DemographicDataPoint {
  key: string;
  label: string; // Localized label
  count: number;
  percentage: number; // Rounded to 1 decimal, sums to 100
  population_percentage?: number; // For representativeness comparison
}

/**
 * Complete demographic field data for frontend consumption
 * Contains pre-processed data points ready for visualization
 */
export interface DemographicField {
  field_id: string;
  field_key: string;
  field_name: string; // Localized name
  field_code?: string | null; // Built-in fields: 'gender', 'birthyear', 'domicile'
  data_points: DemographicDataPoint[];
  r_score?: number; // Representativeness score (0-100)
}

/**
 * Demographics response in frontend format
 * This is what hooks return and components consume
 */
export interface PhaseInsightsDemographics {
  fields: DemographicField[];
}

// ============================================================================
// DEMOGRAPHICS TYPES - BACKEND FORMAT (Series/Options Pattern)
// ============================================================================

/**
 * Backend response format following Report Builder pattern
 * Uses series/options structure for consistency with existing analytics endpoints
 */

/**
 * Option metadata from backend
 * Contains multiloc labels and ordering information
 */
export interface DemographicOption {
  title_multiloc: Record<string, string>; // { en: "Male", fr: "Homme", ... }
  ordering: number;
}

/**
 * Backend demographic field using series/options pattern
 * This is what the API returns before transformation
 */
export interface DemographicFieldBackend {
  field_id: string;
  field_key: string;
  field_name_multiloc: Record<string, string>; // { en: "Gender", fr: "Genre", ... }
  field_code?: string | null;
  r_score?: number;
  series: Record<string, number>; // { "male": 680, "female": 830, "_blank": 10 }
  options?: Record<string, DemographicOption>; // Metadata for each series key
  population_distribution?: Record<string, number>; // Reference population counts
}

/**
 * Backend demographics data (nested in JSONAPI response)
 */
export interface PhaseInsightsDemographicsBackendData {
  id: string;
  type: 'phase_demographics';
  attributes: {
    fields: DemographicFieldBackend[];
  };
}

/**
 * Backend demographics response (full JSONAPI structure)
 * This is what the API returns - hooks return this structure
 */
export interface IPhaseInsightsDemographics {
  data: PhaseInsightsDemographicsBackendData;
}
