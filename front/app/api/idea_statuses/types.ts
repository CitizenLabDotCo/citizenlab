import { Multiloc } from 'typings';

import { ParticipationMethod } from 'api/phases/types';

import { Keys } from 'utils/cl-react-query/types';

import ideaStatusesKeys from './keys';

export type IdeaStatusesKeys = Keys<typeof ideaStatusesKeys>;

export type IdeaStatusParticipationMethod = Extract<
  ParticipationMethod,
  'ideation' | 'proposals'
>;

export type IdeaStatusesQueryParams = {
  participation_method?: IdeaStatusParticipationMethod;
};

type IdeationStatusCode =
  | 'prescreening'
  | 'proposed'
  | 'viewed'
  | 'under_consideration'
  | 'accepted'
  | 'rejected'
  | 'implemented'
  | 'custom';
type ProposalsStatusCode =
  | 'prescreening'
  | 'proposed'
  | 'threshold_reached'
  | 'expired'
  | 'answered'
  | 'ineligible'
  | 'custom';
export type InputStatusCode = IdeationStatusCode | ProposalsStatusCode;

export const ideationInputStatusCodes: IdeationStatusCode[] = [
  'prescreening',
  'proposed',
  'viewed',
  'under_consideration',
  'accepted',
  'rejected',
  'implemented',
  'custom',
];

export const proposalsInputStatusCodes: ProposalsStatusCode[] = [
  'prescreening',
  'proposed',
  'threshold_reached',
  'expired',
  'answered',
  'ineligible',
  'custom',
];

export const inputStatusCodes: Record<
  IdeaStatusParticipationMethod,
  InputStatusCode[]
> = {
  ideation: ideationInputStatusCodes,
  proposals: proposalsInputStatusCodes,
};

export const automatedInputStatusCodes: Set<InputStatusCode> = new Set([
  'proposed',
  'threshold_reached',
  'expired',
]);

export interface IIdeaStatusData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    color: string;
    code: InputStatusCode;
    ordering: number;
    description_multiloc: Multiloc;
    ideas_count?: number;
    locked: boolean;
    can_manually_transition_to: boolean;
    participation_method: IdeaStatusParticipationMethod;
  };
}

export interface IIdeaStatusAdd {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
  color?: string;
  code?: InputStatusCode;
  ordering?: number;
  participation_method: IdeaStatusParticipationMethod;
}

export interface IIdeaStatusUpdate {
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  color?: string;
  code?: InputStatusCode;
  ordering?: number;
  participation_method: IdeaStatusParticipationMethod;
}

export interface IIdeaStatus {
  data: IIdeaStatusData;
}

export interface IIdeaStatuses {
  data: IIdeaStatusData[];
}
