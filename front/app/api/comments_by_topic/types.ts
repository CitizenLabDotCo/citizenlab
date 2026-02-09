import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import commentsByTopicKeys from './keys';

export type CommentsByTopicKeys = Keys<typeof commentsByTopicKeys>;

export interface ICommentsByTopic {
  data: {
    type: 'comments_by_topic';
    attributes: {
      series: {
        comments: {
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

export interface ICommentsByTopicParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  limit?: number;
}
