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

// ============================================================================
// COMMON GROUND INSIGHTS TYPES
// ============================================================================

/**
 * Vote counts for Common Ground statements
 */
export interface VoteCount {
  up: number;
  down: number;
  neutral: number;
}

/**
 * Common Ground statement item
 */
export interface StatementItem {
  id: string;
  title_multiloc: Record<string, string>;
  votes: VoteCount;
  created_at: string;
  demographic_breakdown?: Record<string, VoteCount>;
}

/**
 * Common Ground overall statistics
 */
export interface CommonGroundStats {
  num_participants: number;
  num_ideas: number;
  votes: VoteCount;
}

/**
 * Demographic field for Common Ground (simpler than general demographics)
 */
export interface CommonGroundDemographicField {
  field_id: string;
  field_key: string;
  field_code: string;
  options?: Record<string, DemographicOption>;
}

/**
 * Common Ground results attributes
 */
export interface CommonGroundResultsAttributes {
  stats: CommonGroundStats;
  total_count: number;
  items: StatementItem[];
  demographic_field?: CommonGroundDemographicField;
}

/**
 * Common Ground results data (nested in JSONAPI response)
 */
export interface CommonGroundResultsData {
  type: 'common_ground_results';
  id: string;
  attributes: CommonGroundResultsAttributes;
}

/**
 * Common Ground results response (full JSONAPI structure)
 */
export interface CommonGroundResults {
  data: CommonGroundResultsData;
}

/**
 * Sort options for Common Ground statements
 */
export type SortOption =
  | 'most_agreed'
  | 'most_disagreed'
  | 'most_controversial'
  | 'newest';

/**
 * Group by options for Common Ground demographic breakdown
 */
export type GroupByOption = 'gender' | 'birthyear' | 'domicile' | string;
