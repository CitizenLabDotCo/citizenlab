import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import initiativeStatusesKeys from './keys';

export type InitiativeStatusesKeys = Keys<typeof initiativeStatusesKeys>;

export type InitiativeStatusCode =
  | 'proposed'
  | 'expired'
  | 'threshold_reached'
  | 'answered'
  | 'ineligible'
  | 'custom';

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

export interface IInitiativeStatusAdd {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
  color?: string;
  code?: InitiativeStatusCode;
  ordering?: number;
}

export type InitiativeStatusUpdateWithExistingFeedback = {
  initiativeId: string;
  initiative_status_id: string;
  official_feedback_id?: string;
  body_multiloc?: never;
  author_multiloc?: never;
};

export type InitiativeStatusUpdateWithNewFeedback = {
  initiativeId: string;
  initiative_status_id: string;
  official_feedback_id?: never;
  body_multiloc: Multiloc;
  author_multiloc: Multiloc;
};

export type InitiativeStatusUpdate =
  | InitiativeStatusUpdateWithExistingFeedback
  | InitiativeStatusUpdateWithNewFeedback;
