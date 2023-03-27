import ideasCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type IdeasCountKeys = Keys<typeof ideasCountKeys>;

export interface IQueryParameters {
  projectIds?: string[];
  phaseId?: string;
  topics?: string[];
  ideaStatusId?: string;
  feedbackNeeded?: boolean;
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
