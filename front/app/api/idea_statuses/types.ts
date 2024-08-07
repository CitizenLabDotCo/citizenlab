import { uniq } from 'lodash-es';
import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import ideaStatusesKeys from './keys';

export type IdeaStatusesKeys = Keys<typeof ideaStatusesKeys>;

export type IdeaStatusesQueryParams = {
  participation_method?: 'ideation' | 'proposals';
};

export const inputStatusCodes = {
  ideation: [
    'proposed',
    'viewed',
    'under_consideration',
    'accepted',
    'rejected',
    'implemented',
    'custom',
  ],
  proposals: [
    'proposed',
    'threshold_reached',
    'expired',
    'answered',
    'ineligible',
    'custom',
  ],
} as const;

export const automatedInputStatusCodes = [
  'proposed',
  'threshold_reached',
  'expired',
];

const allMergedInputStatusCodes = uniq(
  Object.keys(inputStatusCodes)
    .map(function (v) {
      return inputStatusCodes[v];
    })
    .flat()
);
export type TIdeaStatusCode = (typeof allMergedInputStatusCodes)[number];

export interface IIdeaStatusData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    color: string;
    code: TIdeaStatusCode;
    ordering: number;
    description_multiloc: Multiloc;
    ideas_count?: number;
    can_reorder: boolean;
    can_transition_manually: boolean;
  };
}

export interface IIdeaStatusAdd {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
  color?: string;
  code?: TIdeaStatusCode;
  ordering?: number;
  participation_method: 'ideation' | 'proposals';
}

export interface IIdeaStatusUpdate {
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  color?: string;
  code?: TIdeaStatusCode;
  ordering?: number;
  participation_method: 'ideation' | 'proposals';
}

export interface IIdeaStatus {
  data: IIdeaStatusData;
}

export interface IIdeaStatuses {
  data: IIdeaStatusData[];
}
