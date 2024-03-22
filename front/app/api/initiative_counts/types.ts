import { Keys } from 'utils/cl-react-query/types';

import initiativesCountKeys from './keys';

export type InitiativesCountKeys = Keys<typeof initiativesCountKeys>;

export interface IQueryParameters {
  author?: string;
  search?: string;
  topics?: string[];
  areas?: string[];
  initiative_status?: string;
  bounding_box?: number[];
  assignee?: string | null;
  feedback_needed?: boolean;
}

export type IInitiativesCount = {
  data: {
    type: 'initiatives_count';
    attributes: {
      count: number;
    };
  };
};
