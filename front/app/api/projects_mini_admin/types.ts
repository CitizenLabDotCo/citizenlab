import {
  Multiloc,
  Pagination,
  ILinks,
  IRelationship,
  SupportedLocale,
} from 'typings';

import { ParticipationMethod } from 'api/phases/types';
import { PublicationStatus, Visibility } from 'api/projects/types';

export type Parameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
  min_start_date?: string;
  max_start_date?: string;
  participation_states?: ParticipationState[];
  folder_ids?: string[];
  participation_methods?: ParticipationMethod[];
  sort:
    | 'recently_viewed'
    | 'phase_starting_or_ending_soon'
    | 'recently_created'
    | 'alphabetically_asc'
    | 'alphabetically_desc';
  locale: SupportedLocale;
} & Pagination;

export type ParticipationState =
  | 'not_started'
  | 'collecting_data'
  | 'informing'
  | 'past';

export type ProjectsMiniAdmin = {
  data: ProjectMiniAdminData[];
  links: ILinks;
};

export type ProjectMiniAdminData = {
  id: string;
  type: 'project_mini_admin';
  attributes: {
    first_phase_start_date: string | null;
    first_published_at: string | null;
    folder_title_multiloc: Multiloc | null;
    last_phase_end_date: string | null;
    current_phase_start_date: string | null;
    current_phase_end_date: string | null;
    publication_status: PublicationStatus;
    title_multiloc: Multiloc;
    visible_to: Visibility;
  };
  relationships: {
    folder?: {
      data: IRelationship | null;
    };
    phases?: {
      data: IRelationship[];
    };
  };
};
