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
import phaseKeys from './keys';

export type PhaseKeys = Keys<typeof phaseKeys>;

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

export interface IPhase {
  data: IPhaseData;
}

export interface IPhases {
  data: IPhaseData[];
}
