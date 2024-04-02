import { Keys } from 'utils/cl-react-query/types';

import ideasCountKeys from './keys';

export type IdeasCountKeys = Keys<typeof ideasCountKeys>;

export interface IQueryParameters {
  projects?: string[];
  phase?: string;
  topics?: string[];
  idea_status_id?: string;
  feedback_needed?: boolean;
  assignee?: string;
  search?: string;
}

export type IIdeasCount = {
  data: {
    type: 'ideas_count';
    attributes: {
      count: number;
    };
  };
};
