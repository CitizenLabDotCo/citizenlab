import { Multiloc, Pagination, ILinks, IRelationship } from 'typings';

import { PublicationStatus, Visibility } from 'api/projects/types';

export type Parameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
  start_at?: string;
  end_at?: string;
  participation_states?: ParticipationState[];
  sort:
    | 'recently_viewed'
    | 'phase_starting_or_ending_soon'
    | 'recently_created';
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
    current_phase?: {
      data: IRelationship | null;
    };
    folder?: {
      data: IRelationship | null;
    };
  };
};
