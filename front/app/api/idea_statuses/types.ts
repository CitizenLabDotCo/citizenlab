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
  participation_method: IdeaStatusParticipationMethod;
  exclude_codes?: InputStatusCode[];
};

/* Ideation status codes */
// Locked status codes are defined in the BE: LOCKED_CODES in models/idea_status.rb
type LockedIdeationInputStatusCode = 'prescreening' | 'proposed';
export type NonLockedIdeationInputStatusCode =
  | 'viewed'
  | 'under_consideration'
  | 'accepted'
  | 'rejected'
  | 'implemented'
  | 'custom';
type IdeationStatusCode =
  | LockedIdeationInputStatusCode
  | NonLockedIdeationInputStatusCode;

/* Proposal status codes */
// Locked status codes are defined in the BE: LOCKED_CODES in models/idea_status.rb
type LockedProposalInputStatusCode =
  | 'prescreening'
  | 'proposed'
  | 'threshold_reached'
  | 'expired';
export type NonLockedProposalInputStatusCode =
  | 'answered'
  | 'ineligible'
  | 'custom';
type ProposalsStatusCode =
  | LockedProposalInputStatusCode
  | NonLockedProposalInputStatusCode;

/* Input status codes */
export type InputStatusCode = IdeationStatusCode | ProposalsStatusCode;

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
