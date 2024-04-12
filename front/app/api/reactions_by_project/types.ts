import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import reactionsByProjectKeys from './keys';

export type ReactionsByProjectKeys = Keys<typeof reactionsByProjectKeys>;

export interface IReactionsByProject {
  data: {
    type: 'reactions_by_project';
    attributes: {
      series: {
        total: {
          [key: string]: number;
        };
      };
      projects: {
        [key: string]: {
          title_multiloc: Multiloc;
        };
      };
    };
  };
}

export interface IReactionsByProjectParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  topic?: string;
}
