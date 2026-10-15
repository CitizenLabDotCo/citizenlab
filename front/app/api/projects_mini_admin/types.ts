import {
  Multiloc,
  Pagination,
  ILinks,
  IRelationship,
  SupportedLocale,
} from 'typings';

import { ReviewState } from 'api/admin_publications/types';
import { IGroupData } from 'api/groups/types';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import {
  IProjectData,
  PublicationStatus,
  Visibility,
} from 'api/projects/types';
import { IUserData } from 'api/users/types';

export const projectSortableParams = [
  'recently_viewed',
  'phase_starting_or_ending_soon',
  'recently_created_asc',
  'recently_created_desc',
  'alphabetically_asc',
  'alphabetically_desc',
  'participation_asc',
  'participation_desc',
  'arranged',
  'status_asc',
  'status_desc',
  'phase_asc',
  'phase_desc',
  'participation_method_asc',
  'participation_method_desc',
  'managers_asc',
  'managers_desc',
  'start_date_asc',
  'start_date_desc',
  'end_date_asc',
  'end_date_desc',
] as const;

export type ProjectSortableParam = (typeof projectSortableParams)[number];

// The status as the admin project list shows it: a draft waiting for review
// approval is 'pending' rather than 'draft'.
export const displayStatuses = [
  'published',
  'pending',
  'draft',
  'archived',
] as const;

export type DisplayStatus = (typeof displayStatuses)[number];

// The phase a project is about right now: the open one that ends soonest, else
// the next to start, else the last that ran.
export type HighlightedPhase = {
  participation_method: ParticipationMethod;
  status: 'active' | 'upcoming' | 'ended';
  start_at: string;
  end_at: string | null;
};

export type Parameters = {
  status?: PublicationStatus[];
  display_status?: DisplayStatus[];
  top_level?: boolean;
  review_state?: ReviewState;
  managers?: string[];
  search?: string;
  min_start_date?: string;
  max_start_date?: string;
  participation_states?: ParticipationState[];
  folder_ids?: string[];
  participation_methods?: ParticipationMethod[];
  visibility?: Visibility[];
  discoverability?: Discoverability[];
  space_ids?: string[];
  sort: ProjectSortableParam;
  locale: SupportedLocale;
} & Pagination;

export type ParticipationState =
  | 'not_started'
  | 'starting_soon'
  | 'no_phases'
  | 'collecting_data'
  | 'informing'
  | 'past';

export type Discoverability = 'listed' | 'unlisted';

type Included = (IUserData | IProjectData | IGroupData | IPhaseData)[];

export type ProjectsMiniAdmin = {
  data: ProjectMiniAdminData[];
  links: ILinks;
  included?: Included;
  meta: { total: number };
};

export type ProjectMiniAdminData = {
  id: string;
  type: 'project_mini_admin';
  attributes: {
    active_phases_start_date: string | null;
    active_phases_end_date: string | null;
    display_status: DisplayStatus;
    highlighted_phase: HighlightedPhase | null;
    first_phase_start_date: string | null;
    first_published_at: string | null;
    folder_title_multiloc: Multiloc | null;
    space_title_multiloc: Multiloc | null;
    last_phase_end_date: string | null;
    listed: boolean;
    publication_status: PublicationStatus;
    scheduled_at: string | null;
    title_multiloc: Multiloc;
    visible_to: Visibility;
  };
  relationships: {
    folder?: {
      data: IRelationship | null;
    };
    space?: {
      data: IRelationship | null;
    };
    phases?: {
      data: IRelationship[];
    };
    project_images: {
      data: {
        id: string;
        type: 'project_image';
      }[];
    };
    groups: {
      data: {
        id: string;
        type: 'group';
      }[];
    };
    moderators: {
      data: IRelationship[];
    };
  };
};
