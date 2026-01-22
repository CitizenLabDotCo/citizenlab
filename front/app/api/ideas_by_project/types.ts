import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import ideasByProjectKeys from './keys';

export type IdeasByProjectKeys = Keys<typeof ideasByProjectKeys>;

export interface IIdeasByProject {
  data: {
    type: 'ideas_by_project';
    attributes: {
      series: {
        ideas: {
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

export interface IIdeasByProjectParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  input_topic?: string;
}
