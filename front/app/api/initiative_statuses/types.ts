import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import initiativeStatusesKeys from './keys';

export type InitiativeStatusesKeys = Keys<typeof initiativeStatusesKeys>;

export type InitiativeStatusCode =
  | 'review_pending'
  | 'changes_requested'
  | 'proposed'
  | 'expired'
  | 'threshold_reached'
  | 'answered'
  | 'ineligible';

export interface IInitiativeStatusData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    color: string;
    code: InitiativeStatusCode;
    ordering: number;
    description_multiloc: Multiloc;
    transition_type: 'manual' | 'automatic';
  };
}

export interface IInitiativeStatuses {
  data: IInitiativeStatusData[];
}

export interface IInitiativeStatus {
  data: IInitiativeStatusData;
}

export type InitiativeStatusUpdateWithExistingFeedback = {
  initiativeId: string;
  initiative_status_id: string;
  official_feedback_id?: string;
  official_feedback_attributes?: never;
};

export type InitiativeStatusUpdateWithNewFeedback = {
  initiativeId: string;
  initiative_status_id: string;
  official_feedback_id?: never;
  official_feedback_attributes?: {
    body_multiloc: Multiloc;
    author_multiloc: Multiloc;
  };
};

export type InitiativeStatusUpdate =
  | InitiativeStatusUpdateWithExistingFeedback
  | InitiativeStatusUpdateWithNewFeedback;
