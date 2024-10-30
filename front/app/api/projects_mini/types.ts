import { Multiloc, ILinks } from 'typings';

import { ActionDescriptors } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

export type QueryParameters = {
  'page[number]'?: number;
  'page[size]'?: number;
};

export type MiniProjectsKeys = Keys<typeof miniProjectsKeys>;

export interface MiniProjects {
  data: MiniProjectData[];
  links: ILinks;
}

interface MiniProjectData {
  id: string;
  type: 'project_mini';
  attributes: {
    title_multiloc: Multiloc;
    slug: string;
    action_descriptors: ActionDescriptors;
  };
}
