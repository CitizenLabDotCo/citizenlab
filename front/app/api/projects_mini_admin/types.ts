import { Multiloc, Pagination, ILinks } from 'typings';

import { PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import projectsMiniAdminKeys from './keys';

export type Parameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
  start_at?: string;
  end_at?: string;
  sort:
    | 'recently_viewed'
    | 'phase_starting_or_ending_soon'
    | 'recently_created';
} & Pagination;

export type ProjectsMiniAdminKeys = Keys<typeof projectsMiniAdminKeys>;

export type ProjectsMiniAdmin = {
  data: ProjectMiniAdminData[];
  links: ILinks;
};

type ProjectMiniAdminData = {
  id: string;
  type: 'project_mini_admin';
  attributes: {
    title_multiloc: Multiloc;
    publication_status: PublicationStatus;
  };
  links: {
    self: string;
  };
};
