import { Multiloc, ILinks } from 'typings';

import { ActionDescriptors, PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

type PageNumbers = {
  'page[number]'?: number;
  'page[size]'?: number;
};

type ActiveParticipatoryPhase = {
  endpoint: 'with_active_participatory_phase';
} & PageNumbers;

type FollowedItem = {
  endpoint: 'for_followed_item';
} & PageNumbers;

export type FinishedOrArchived = {
  endpoint: 'finished_or_archived';
  filter_by: 'finished' | 'archived' | 'finished_and_archived';
} & PageNumbers;

type Areas = {
  endpoint: 'for_areas';
  areas?: string[];
} & PageNumbers;

type ForAdmin = {
  endpoint: 'for_admin';
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
  start_at?: string;
  end_at?: string;
  sort:
    | 'recently_viewed'
    | 'phase_starting_or_ending_soon'
    | 'recently_created';
} & PageNumbers;

export type Parameters =
  | ActiveParticipatoryPhase
  | FollowedItem
  | FinishedOrArchived
  | Areas
  | ForAdmin;

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
