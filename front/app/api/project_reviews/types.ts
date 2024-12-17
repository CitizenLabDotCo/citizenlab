import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import projectReviewsKeys from './keys';

export type ProjectReviewsKeys = Keys<typeof projectReviewsKeys>;

export type ProjectReviewData = {
  id: string;
  type: 'project_review';
  attributes: {
    state: 'approved' | 'pending';
    approved_at: string | null;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    project: { data: IRelationship };
    requester: { data: IRelationship };
    reviewer: { data?: IRelationship } | null;
  };
};

export type ProjectReview = {
  data: ProjectReviewData;
};
