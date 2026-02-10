import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import ideasByTopicKeys from './keys';

export type IdeasByTopicKeys = Keys<typeof ideasByTopicKeys>;

export interface IIdeasByTopic {
  data: {
    type: 'ideas_by_topic';
    attributes: {
      series: {
        ideas: {
          [key: string]: number;
        };
      };
      topics: {
        [key: string]: {
          title_multiloc: Multiloc;
        };
      };
    };
  };
}

export interface IIdeasByTopicParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  limit?: number;
}
