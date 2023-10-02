import { IRelationship, Multiloc } from 'typings';
import {
  ParticipationMethod,
  TSurveyService,
  IdeaDefaultSortMethod,
  InputTerm,
  ParticipationContext,
} from 'utils/participationContexts';
import { Keys } from 'utils/cl-react-query/types';
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
  };
}

export interface IPhaseAttributes extends ParticipationContext {
  start_at: string;
  end_at: string;
  campaigns_settings: { [key in CampaignName]?: boolean };
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
