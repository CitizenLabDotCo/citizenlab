import {IRelationship, Multiloc} from 'typings';
import {Keys} from 'utils/cl-react-query/types';
import phasesKeys from './keys';
import { CampaignName } from 'api/campaigns/types';

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
    report?: {
      data: IRelationship | null;
    };
  };
}

export interface IPhaseAttributes {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  start_at: string;
  end_at: string | null;
  campaigns_settings: { [key in CampaignName]?: boolean };
  input_term: InputTerm;
  created_at: string;
  updated_at: string;
  participation_method: ParticipationMethod;
  posting_enabled: boolean;
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
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  document_annotation_embed_url?: string | null;
  voting_method?: VotingMethod | null;
  voting_term_singular_multiloc?: Multiloc | null;
  voting_term_plural_multiloc?: Multiloc | null;
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  ideas_count: number;
  baskets_count?: number | null;
  votes_count?: number | null;
  qr_code?: QrCode | null;
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
  end_at?: string;
  participation_method?: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method?: 'limited' | 'unlimited' | null;
  reacting_dislike_method?: 'limited' | 'unlimited' | null;
  reacting_like_limited_max?: number | null;
  reacting_dislike_enabled?: boolean | null;
  reacting_dislike_limited_max?: number | null;
  presentation_mode?: 'card' | 'map' | null;
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  document_annotation_embed_url?: string | null;
  campaigns_settings?: object;
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
  | 'information'
  | 'native_survey'
  | 'survey'
  | 'voting'
  | 'poll'
  | 'volunteering'
  | 'document_annotation';

export type VotingMethod = 'budgeting' | 'multiple_voting' | 'single_voting';

export type IdeaDefaultSortMethod =
  | 'trending'
  | 'random'
  | 'popular'
  | 'new'
  | '-new'
  | null;

export type InputTerm =
  | 'idea'
  | 'option'
  | 'project'
  | 'question'
  | 'issue'
  | 'contribution';

export type PresentationMode = 'card' | 'map';

export interface QrCode {
  key: string;
  max_regs?: number;
}
