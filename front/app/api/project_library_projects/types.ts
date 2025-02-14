import { Multiloc, ILinks } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

export type Parameters = {
  'page[number]'?: number;
  'page[size]'?: number;
};

export type ProjectLibraryProjectsKeys = Keys<typeof miniProjectsKeys>;

export interface ProjectLibraryProjects {
  data: ProjectLibraryProjectData[];
  links: ILinks;
}

export interface ProjectLibraryProjectData {
  id: string;
  type: 'project_library_project';
  attributes: {
    slug: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    title_en: string;
  };
}
