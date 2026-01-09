import { DemographicOption } from '../types';

export interface VotingDemographicBreakdown {
  count: number;
  percentage: number;
}

/**
 * Backend format for demographic options.
 * Each option is a record with:
 * - An optional 'ordering' key with a number value
 * - One other key-value pair where:
 *   - The key is the demographic field key (e.g., 'gender', 'birthyear')
 *   - The value is an object with id and title_multiloc (for select/multiselect/checkbox fields)
 */
export type BackendDemographicOption = {
  ordering?: number;
  [demographicKey: string]:
    | { id: string; title_multiloc: Record<string, string> }
    | number
    | undefined;
};

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

export interface VotingPhaseVotesAttributes {
  online_votes: number;
  offline_votes: number;
  total_votes: number;
  group_by?: string;
  custom_field_id?: string;
  input_type?: string;
  options?: BackendDemographicOption[];
  ideas: VotingIdeaResult[];
}

export interface TransformedVotingPhaseVotesAttributes
  extends Omit<VotingPhaseVotesAttributes, 'options'> {
  options?: Record<string, DemographicOption>;
}

export interface VotingPhaseVotesData {
  type: 'voting_phase_votes';
  id: string;
  attributes: VotingPhaseVotesAttributes;
}

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

export type DemographicFieldKey = 'gender' | 'birthyear' | 'domicile' | string;
