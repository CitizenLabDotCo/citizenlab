import { IResolution } from 'components/admin/ResolutionControl';

/**
 * Method-specific metric types
 * These match the backend API response structure from phase insights endpoint
 */
export interface IdeationMetrics {
  ideas_posted: number;
  ideas_posted_last_7_days?: number;
  comments_posted: number;
  comments_posted_last_7_days?: number;
  reactions: number;
  reactions_last_7_days?: number;
}

export interface ProposalsMetrics {
  ideas_posted: number;
  ideas_posted_last_7_days?: number;
  comments_posted: number;
  comments_posted_last_7_days?: number;
  reactions: number;
  reactions_last_7_days?: number;
}

export interface VotingMetrics {
  voting_method: string;
  online_votes: number;
  online_votes_last_7_days?: number;
  offline_votes: number;
  voters: number;
  voters_last_7_days?: number;
  associated_ideas: number;
  comments_posted: number;
  comments_posted_last_7_days?: number;
}

export interface BudgetingMetrics {
  voting_method: 'budgeting';
  online_picks: number;
  online_picks_last_7_days?: number;
  offline_picks: number;
  voters: number;
  voters_last_7_days?: number;
  associated_ideas: number;
  comments_posted: number;
  comments_posted_last_7_days?: number;
}

export interface SurveyMetrics {
  submitted_surveys: number;
  submitted_surveys_last_7_days?: number;
  completion_rate: number; // Decimal format from backend (0.78 = 78%)
}

export interface PollMetrics {
  responses: number;
  responses_last_7_days?: number;
}

export interface CommonGroundMetrics {
  associated_ideas: number;
  ideas_posted: number;
  ideas_posted_last_7_days?: number;
  reactions: number;
  reactions_last_7_days?: number;
}

export interface VolunteeringMetrics {
  volunteerings: number;
  volunteerings_last_7_days?: number;
}

/**
 * Participation metrics attributes (nested in JSONAPI response)
 */
export interface PhaseInsightsParticipationMetrics {
  visitors: number;
  participants: number;
  engagement_rate: number;
  // Time comparison (for "Last 7 days" deltas)
  visitors_last_7_days?: number;
  participants_last_7_days?: number;
  // Method-specific metrics nested by participation method
  ideation?: IdeationMetrics;
  proposals?: ProposalsMetrics;
  voting?: VotingMetrics;
  budgeting?: BudgetingMetrics;
  native_survey?: SurveyMetrics;
  survey?: SurveyMetrics;
  poll?: PollMetrics;
  common_ground?: CommonGroundMetrics;
  volunteering?: VolunteeringMetrics;
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

export interface ChartTimeseriesDataPoint {
  participants: number;
  visitors: number;
  date_group: string;
}

export interface ParticipantsAndVisitorsChartData {
  resolution: IResolution;
  timeseries: ChartTimeseriesDataPoint[];
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
  id: string;
  key: string;
  code?: string | null;
  input_type: string; // 'select', 'checkbox', 'multiselect', 'number'
  title_multiloc: Record<string, string>; // { en: "Gender", fr: "Genre", ... }
  r_score?: number | null;
  series: Record<string, number>; // { "male": 680, "female": 830, "_blank": 10 }
  options?: Record<string, DemographicOption>; // Metadata for each series key
  reference_distribution?: Record<string, number>; // Reference population counts
}

/**
 * Consolidated phase insights attributes from single API endpoint
 * Contains metrics, demographics, and chart data
 */
export interface PhaseInsightsAttributes {
  metrics: PhaseInsightsParticipationMetrics;
  demographics: {
    fields: DemographicFieldBackend[];
  };
  participants_and_visitors_chart_data: ParticipantsAndVisitorsChartData;
}

/**
 * Phase insights data (nested in JSONAPI response)
 */
export interface PhaseInsightsData {
  id: string;
  type: 'phase_insights';
  attributes: PhaseInsightsAttributes;
}

/**
 * Consolidated phase insights response (full JSONAPI structure)
 * This is what the API returns from GET /phases/:id/insights
 */
export interface IPhaseInsights {
  data: PhaseInsightsData;
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
