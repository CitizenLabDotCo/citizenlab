import { Multiloc, ILinks, Pagination } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

type ActiveParticipatoryPhase = {
  endpoint: 'with_active_participatory_phase';
} & Pagination;

type FollowedItem = {
  endpoint: 'for_followed_item';
} & Pagination;

export type FinishedOrArchived = {
  endpoint: 'finished_or_archived';
  filter_by: 'finished' | 'archived' | 'finished_and_archived';
} & Pagination;

type Areas = {
  endpoint: 'for_areas';
  areas?: string[];
} & Pagination;

export type Parameters =
  | ActiveParticipatoryPhase
  | FollowedItem
  | FinishedOrArchived
  | Areas;

export type MiniProjectsKeys = Keys<typeof miniProjectsKeys>;

export interface MiniProjects {
  data: MiniProjectData[];
  links: ILinks;
}

export interface MiniProjectData {
  id: string;
  type: 'project_mini';
  attributes: {
    slug: string;
    participation_status: 'active' | 'upcoming' | 'ended' | null;
    days_until_start: number | null;
    days_since_end: number | null;
    title_multiloc: Multiloc;
  };
  relationships: {
    highlighted_phase?: {
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
