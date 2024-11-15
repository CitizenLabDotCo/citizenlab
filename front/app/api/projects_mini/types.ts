import { Multiloc, ILinks } from 'typings';

import { ActionDescriptors } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

type Endpoint = 'with_active_participatory_phase' | 'for_followed_item';

export type Parameters = {
  endpoint: Endpoint;
  'page[number]'?: number;
  'page[size]'?: number;
};

export type MiniProjectsKeys = Keys<typeof miniProjectsKeys>;

export interface MiniProjects {
  data: MiniProjectData[];
  links: ILinks;
}

export interface MiniProjectData {
  id: string;
  type: 'project_mini';
  attributes: {
    action_descriptors: ActionDescriptors;
    slug: string;
    starts_days_from_now: number | null;
    ended_days_ago: number | null;
    title_multiloc: Multiloc;
  };
  relationships: {
    current_phase?: {
      data: {
        id: string;
      } | null;
    };
    project_images: {
      data: {
        id: string;
        type: 'project_image';
      }[];
    };
  };
}
