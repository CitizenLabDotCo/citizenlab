import { Sort, IIdeaQueryParameters } from 'api/ideas/types';

import { Keys } from 'utils/cl-react-query/types';

import ideaFilterCountsKeys from './keys';

export type IdeaFilterCountsKeys = Keys<typeof ideaFilterCountsKeys>;

export interface IIdeasFilterCounts {
  data: {
    type: 'filter_counts';
    attributes: {
      idea_status_id: {
        [key: string]: number;
      };
      area_id: {
        [key: string]: number;
      };
      input_topic_id: {
        [key: string]: number;
      };
      total: number;
    };
  };
}

export interface IIdeasFilterCountsQueryParameters
  extends Omit<IIdeaQueryParameters, 'page[number]' | 'page[size]' | 'sort'> {
  sort?: Sort;
}
