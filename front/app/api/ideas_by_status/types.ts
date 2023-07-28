import { Keys } from 'utils/cl-react-query/types';
import ideasByStatusKeys from './keys';
import { Multiloc } from 'typings';

export type IdeasByStatusKeys = Keys<typeof ideasByStatusKeys>;

export interface IIdeasByStatus {
  data: {
    type: 'ideas_by_status';
    attributes: {
      series: {
        ideas: {
          [key: string]: number;
        };
      };
      idea_status: {
        [key: string]: {
          title_multiloc: Multiloc;
          color: string;
          ordering: number;
        };
      };
    };
  };
}

export interface IIdeasByStatusParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  topic?: string;
}
