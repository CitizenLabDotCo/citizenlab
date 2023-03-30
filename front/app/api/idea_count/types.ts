import ideasCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type IdeasCountKeys = Keys<typeof ideasCountKeys>;

export interface IQueryParameters {
  projects?: string[] | null;
  phase?: string | null;
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
