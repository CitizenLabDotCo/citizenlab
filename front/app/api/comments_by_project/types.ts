import { Keys } from 'utils/cl-react-query/types';
import commentsByProjectKeys from './keys';
import { Multiloc } from 'typings';

export type CommentsByProjectKeys = Keys<typeof commentsByProjectKeys>;

export interface ICommentsByProject {
  data: {
    type: 'comments_by_project';
    attributes: {
      series: {
        comments: {
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

export interface ICommentsByProjectParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  topic?: string;
}
