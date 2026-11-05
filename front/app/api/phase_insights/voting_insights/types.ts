export interface VotingDemographicBreakdown {
  count: number;
  percentage: number;
}

/**
 * Backend format for demographic options.
 * Each option contains title_multiloc and ordering.
 * The options are returned as an object keyed by option key (e.g., 'male', 'female').
 */
export type BackendDemographicOption = {
  title_multiloc: Record<string, string>;
  ordering: number;
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
  options?: Record<string, BackendDemographicOption>;
  ideas: VotingIdeaResult[];
}

export interface VotingPhaseVotesData {
  type: 'voting_phase_votes';
  id: string;
  attributes: VotingPhaseVotesAttributes;
}

export interface VotingPhaseVotes {
  data: VotingPhaseVotesData;
}

export type DemographicFieldKey = 'gender' | 'birthyear' | 'domicile' | string;
