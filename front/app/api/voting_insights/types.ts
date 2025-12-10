import { DemographicOption } from 'api/phase_insights/types';

/**
 * Demographic vote breakdown for a single idea
 * Each key is a demographic option (e.g., 'male', 'female')
 * Note: Only contains online votes since offline votes cannot be attributed to demographics
 */
export interface VotingDemographicBreakdown {
  count: number;
  percentage: number;
}

/**
 * Individual idea in voting phase votes results
 */
export interface VotingIdeaResult {
  id: string;
  title_multiloc: Record<string, string>;
  image_url?: string;
  online_votes: number;
  offline_votes: number;
  total_votes: number;
  percentage: string; // Pre-calculated percentage as string (e.g., "17")
  demographic_breakdown?: Record<string, VotingDemographicBreakdown>;
}

/**
 * Voting phase votes attributes
 */
export interface VotingPhaseVotesAttributes {
  total_votes: number;
  group_by?: string; // custom_field.key (e.g., 'gender')
  custom_field_id?: string;
  options?: Record<string, DemographicOption>; // Demographic option labels
  ideas: VotingIdeaResult[];
}

/**
 * Voting phase votes data (nested in JSONAPI response)
 */
export interface VotingPhaseVotesData {
  type: 'voting_phase_votes';
  id: string;
  attributes: VotingPhaseVotesAttributes;
}

/**
 * Voting phase votes response (full JSONAPI structure)
 */
export interface VotingPhaseVotes {
  data: VotingPhaseVotesData;
}

/**
 * Group by options for demographic breakdown. This is temporary. To be removed and set to backend
 */
export type GroupByOption = 'gender' | 'birthyear' | 'domicile' | string;
