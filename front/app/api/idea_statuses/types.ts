import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import ideaStatusesKeys from './keys';

export type IdeaStatusesKeys = Keys<typeof ideaStatusesKeys>;

export const ideaStatusCodes = [
  'proposed',
  'viewed',
  'under_consideration',
  'accepted',
  'implemented',
  'rejected',
  'custom',
] as const;

export type TIdeaStatusCode = typeof ideaStatusCodes[number];

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
  };
}

export interface IIdeaStatusAdd {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
  color?: string;
  code?: TIdeaStatusCode;
  ordering?: number;
}

export interface IIdeaStatusUpdate {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
  color?: string;
  code?: TIdeaStatusCode;
  ordering?: number;
}

export interface IIdeaStatus {
  data: IIdeaStatusData;
}

export interface IIdeaStatuses {
  data: IIdeaStatusData[];
}
