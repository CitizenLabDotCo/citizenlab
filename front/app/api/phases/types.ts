import { IRelationship, Multiloc } from 'typings';
import {
  ParticipationMethod,
  TSurveyService,
  IdeaDefaultSortMethod,
  InputTerm,
  ReactingMethod,
  PresentationMode,
} from 'services/participationContexts';
import { Keys } from 'utils/cl-react-query/types';
import phasesKeys from './keys';

export type PhasesKeys = Keys<typeof phasesKeys>;

export type TPhases = IPhaseData[] | undefined | null | Error;

export interface IPhaseData {
  id: string;
  type: string;
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
  };
}

export interface IPhaseAttributes {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  input_term: InputTerm;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
  participation_method: ParticipationMethod;
  posting_enabled: boolean;
  commenting_enabled: boolean;
  reacting_enabled: boolean;
  reacting_like_method: ReactingMethod;
  reacting_like_limited_max: number;
  reacting_dislike_method: ReactingMethod;
  allow_anonymous_participation: boolean;
  reacting_dislike_enabled: boolean;
  reacting_dislike_limited_max: number;
  presentation_mode: PresentationMode;
  min_budget?: number;
  max_budget?: number;
  survey_service?: TSurveyService;
  survey_embed_url?: string;
  poll_anonymous?: boolean;
  ideas_count: number;
  ideas_order?: IdeaDefaultSortMethod;
  document_annotation_embed_url?: string;
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
  min_budget?: number | null;
  max_budget?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  document_annotation_embed_url?: string | null;
}
export interface AddPhaseObject extends IUpdatedPhaseProperties {
  projectId: string;
}

export interface UpdatePhaseObject extends IUpdatedPhaseProperties {
  phaseId: string;
}
