import { Keys } from 'utils/cl-react-query/types';
import initiativeFilterCountsKeys from './keys';

export type InitiativeFilterCountsKeys = Keys<
  typeof initiativeFilterCountsKeys
>;

export type Sort =
  | 'new'
  | '-new'
  | 'author_name'
  | '-author_name'
  | 'upvotes_count'
  | '-upvotes_count'
  | 'status'
  | '-status'
  | 'random';

export type InitiativePublicationStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'spam';

export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  author?: string | undefined | null;
  sort?: Sort;
  search?: string | undefined | null;
  topics?: string[] | undefined | null;
  areas?: string[] | undefined | null;
  initiative_status?: string | undefined | null;
  publication_status?: InitiativePublicationStatus | undefined | null;
  bounding_box?: number[] | undefined | null;
  assignee?: string | undefined | null;
  feedback_needed?: boolean | undefined | null;
}

export interface IInitiativesFilterCounts {
  data: {
    type: 'filter_counts';
    attributes: {
      initiative_status_id: {
        [key: string]: number;
      };
      area_id: {
        [key: string]: number;
      };
      topic_id: {
        [key: string]: number;
      };
      total: number;
    };
  };
}
