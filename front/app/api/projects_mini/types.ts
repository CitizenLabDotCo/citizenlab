import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

export type QueryParameters = {
  'page[number]': number;
  'page[size]': number;
};

export type MiniProjectsKeys = Keys<typeof miniProjectsKeys>;

export interface MiniProjects {
  data: MiniProjectData[];
}

interface MiniProjectData {
  id: string;
  type: 'project_mini';
  attributes: {
    bla: string;
  };
}
