import initiativesCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type InitiativesCountKeys = Keys<typeof initiativesCountKeys>;

export interface IQueryParameters {
  author?: string | undefined;
  search?: string | undefined;
  topics?: string[] | undefined;
  areas?: string[] | undefined;
  initiative_status?: string | undefined;
  bounding_box?: number[] | undefined;
  assignee?: string | undefined;
  feedback_needed?: boolean | undefined;
}

export type IInitiativesCount = {
  data: {
    type: 'initiatives_count';
    attributes: {
      count: number;
    };
  };
};
