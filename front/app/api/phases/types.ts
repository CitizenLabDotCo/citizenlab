import { IRelationship, Multiloc } from 'typings';
import {
  ParticipationMethod,
  TSurveyService,
  IdeaDefaultSortMethod,
  InputTerm,
  VotingMethod,
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
  voting_enabled: boolean;
  upvoting_method: VotingMethod;
  upvoting_limited_max: number;
  downvoting_method: VotingMethod;
  allow_anonymous_participation: boolean;
  downvoting_enabled: boolean;
  downvoting_limited_max: number;
  presentation_mode: PresentationMode;
  min_budget?: number;
  max_budget?: number;
  survey_service?: TSurveyService;
  survey_embed_url?: string;
  poll_anonymous?: boolean;
  ideas_count: number;
  ideas_order?: IdeaDefaultSortMethod;
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
  voting_enabled?: boolean | null;
  upvoting_method?: 'limited' | 'unlimited' | null;
  downvoting_method?: 'limited' | 'unlimited' | null;
  upvoting_limited_max?: number | null;
  downvoting_enabled?: boolean | null;
  downvoting_limited_max?: number | null;
  presentation_mode?: 'card' | 'map' | null;
  min_budget?: number | null;
  max_budget?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
}
export interface AddPhaseObject extends IUpdatedPhaseProperties {
  projectId: string;
}

export interface UpdatePhaseObject extends IUpdatedPhaseProperties {
  phaseId: string;
}
