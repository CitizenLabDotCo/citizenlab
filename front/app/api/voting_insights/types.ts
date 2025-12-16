import { DemographicOption } from 'api/phase_insights/types';

export interface VotingDemographicBreakdown {
  count: number;
  percentage: number;
}

export type BackendDemographicOption = Record<
  string,
  { id: string; title_multiloc: Record<string, string> } | number
>;

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

export type GroupByOption = 'gender' | 'birthyear' | 'domicile' | string;
