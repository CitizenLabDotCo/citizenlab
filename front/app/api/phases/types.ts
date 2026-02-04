import { IRelationship, Multiloc } from 'typings';

import { UserDataCollection } from 'api/phase_permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import phasesKeys from './keys';

export type PhasesKeys = Keys<typeof phasesKeys>;

export type TPhases = IPhaseData[] | undefined | null | Error;

export interface IPhaseData {
  id: string;
  type: 'phase';
  attributes: IPhaseAttributes;
  relationships: {
    permissions: {
      data: IRelationship[];
    };
    project: {
      data: IRelationship;
    };
    user_basket?: {
      data: IRelationship | null;
    };
    manual_voters_last_updated_by?: {
      data: IRelationship | null;
    };
    report?: {
      data: IRelationship | null;
    };
  };
}

export interface IPhaseAttributes {
  voting_filtering_enabled: boolean;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  start_at: string;
  end_at: string | null;
  input_term: InputTerm;
  created_at: string;
  updated_at: string;
  participation_method: ParticipationMethod;
  submission_enabled: boolean;
  autoshare_results_enabled?: boolean;
  commenting_enabled: boolean;
  reacting_enabled: boolean;
  reacting_like_method: 'limited' | 'unlimited';
  reacting_like_limited_max: number;
  reacting_dislike_method: 'limited' | 'unlimited';
  allow_anonymous_participation: boolean;
  reacting_dislike_enabled: boolean;
  reacting_dislike_limited_max: number;
  presentation_mode: PresentationMode;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  survey_popup_frequency?: number | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaSortMethod;
  document_annotation_embed_url?: string | null;
  custom_form_persisted?: boolean;
  voting_method?: VotingMethod | null;
  vote_term?: VoteTerm; // Some existing phases in reports JSON may not have this defined.
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  voting_min_selected_options?: number | null;
  voting_max_votes_per_idea?: number | null;
  ideas_count: number;
  baskets_count: number;
  /** For budgeting it's: for each idea multiply price of the idea
   * with the idea's baskets_count, then sum all those to get the total idea votes for the phase  */
  votes_count: number;
  total_votes_amount: number;
  report_public: boolean;
  native_survey_title_multiloc?: Multiloc;
  native_survey_button_multiloc?: Multiloc;
  prescreening_enabled?: boolean;
  manual_voters_amount?: number;
  similarity_enabled?: boolean;
  similarity_threshold_title?: number | null;
  similarity_threshold_body?: number | null;
  user_data_collection: UserDataCollection;
  user_fields_in_form_enabled: boolean;
}

export interface IPhases {
  data: IPhaseData[];
}

export interface IPhase {
  data: IPhaseData;
}

export interface IUpdatedPhaseProperties {
  project_id?: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  input_term?: InputTerm;
  start_at?: string;
  end_at?: string | null;
  participation_method?: ParticipationMethod;
  voting_method?: VotingMethod | null;
  voting_min_selected_options?: number | null;
  submission_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  autoshare_results_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method?: 'limited' | 'unlimited' | null;
  reacting_dislike_method?: 'limited' | 'unlimited' | null;
  reacting_like_limited_max?: number | null;
  reacting_dislike_enabled?: boolean | null;
  reacting_dislike_limited_max?: number | null;
  reacting_threshold?: number | null;
  presentation_mode?: 'card' | 'map' | 'feed' | null;
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  voting_filtering_enabled?: boolean | null;
  vote_term?: VoteTerm;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  survey_popup_frequency?: number | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaSortMethod;
  document_annotation_embed_url?: string | null;
  native_survey_title_multiloc?: Multiloc;
  native_survey_button_multiloc?: Multiloc;
  prescreening_enabled?: boolean | null;
  allow_anonymous_participation?: boolean;
  expire_days_limit?: number;
  manual_voters_amount?: number;
  similarity_enabled?: boolean | null;
  similarity_threshold_title?: number | null;
  similarity_threshold_body?: number | null;
}

export interface AddPhaseObject extends IUpdatedPhaseProperties {
  projectId: string;
}

export interface UpdatePhaseObject extends IUpdatedPhaseProperties {
  phaseId: string;
}

export type TSurveyService =
  | 'typeform'
  | 'survey_xact'
  | 'survey_monkey'
  | 'google_forms'
  | 'enalyzer'
  | 'qualtrics'
  | 'smart_survey'
  | 'microsoft_forms'
  | 'snap_survey';

export type ParticipationMethod =
  | 'ideation'
  | 'common_ground'
  | 'information'
  | 'native_survey'
  | 'community_monitor_survey'
  | 'survey'
  | 'voting'
  | 'poll'
  | 'volunteering'
  | 'document_annotation'
  | 'proposals';

export type VotingMethod = 'budgeting' | 'multiple_voting' | 'single_voting';

export type VoteTerm = 'vote' | 'point' | 'token' | 'credit' | 'percent';

export type IdeaSortMethod =
  | 'trending'
  | 'comments_count'
  | 'random'
  | 'popular'
  | 'new'
  | '-new';

export type InputTerm =
  | 'idea'
  | 'option'
  | 'project'
  | 'question'
  | 'issue'
  | 'contribution'
  | 'proposal'
  | 'initiative'
  | 'petition';

export type PresentationMode = 'card' | 'map' | 'feed';
