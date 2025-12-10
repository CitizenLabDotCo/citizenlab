import { DemographicOption } from 'api/phase_insights/types';

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
 * Group by options for demographic breakdown
 */
export type GroupByOption = 'gender' | 'birthyear' | 'domicile' | string;
