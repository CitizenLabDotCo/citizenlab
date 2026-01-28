import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import reactionsByTopicKeys from './keys';

export type ReactionsByTopicKeys = Keys<typeof reactionsByTopicKeys>;

export interface IReactionsByTopic {
  data: {
    type: 'reactions_by_topic';
    attributes: {
      series: {
        reactions: {
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

export interface IReactionsByTopicParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  topic?: string;
  limit?: number;
}
