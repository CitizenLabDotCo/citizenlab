import { Keys } from 'utils/cl-react-query/types';
import initiativeFilterCountsKeys from './keys';
import { Sort, IQueryParameters } from 'api/initiatives/types';

export type InitiativeFilterCountsKeys = Keys<
  typeof initiativeFilterCountsKeys
>;

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

export type { Sort, IQueryParameters };
