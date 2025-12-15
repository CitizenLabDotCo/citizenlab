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

export type BackendDemographicOption = Record<
  string,
  { id: string; title_multiloc: Record<string, string> } | number
>;

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
  percentage: number | null;
  series?: Record<string, VotingDemographicBreakdown>;
}

/**
 * Voting phase votes attributes
 */
export interface VotingPhaseVotesAttributes {
  online_votes: number;
  offline_votes: number;
  total_votes: number;
  group_by?: string; // custom_field.key (e.g., 'gender')
  custom_field_id?: string;
  input_type?: string;
  options?: BackendDemographicOption[];
  ideas: VotingIdeaResult[];
}

/**
 * Transformed attributes with options as Record for frontend use
 */
export interface TransformedVotingPhaseVotesAttributes
  extends Omit<VotingPhaseVotesAttributes, 'options'> {
  options?: Record<string, DemographicOption>;
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

export interface TransformedVotingPhaseVotesData {
  type: 'voting_phase_votes';
  id: string;
  attributes: TransformedVotingPhaseVotesAttributes;
}

export interface TransformedVotingPhaseVotes {
  data: TransformedVotingPhaseVotesData;
}

/**
 * Group by options for demographic breakdown. This is temporary. To be removed and set to backend
 */
export type GroupByOption = 'gender' | 'birthyear' | 'domicile' | string;
