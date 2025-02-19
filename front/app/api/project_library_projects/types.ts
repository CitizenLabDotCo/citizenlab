import { Multiloc, ILinks } from 'typings';

import { PublicationStatus, Visibility } from 'api/projects/types';

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
    cl_created_at: string;
    cl_updated_at: string;
    comments_count: number;
    created_at: string;
    description_en: string;
    description_multiloc: Multiloc;
    end_at: string | null;
    folder_id: string | null;
    folder_title_en: string;
    folder_title_multiloc: Multiloc;
    participants: number;
    practical_end_at: string | null;
    publication_status: PublicationStatus;
    score_feedback: number | null;
    score_influence: number | null;
    score_process: number | null;
    score_total: number | null;
    slack_references_count: number;
    slug: string;
    start_at: string;
    tenant_country_alpha2: null;
    tenant_host: string;
    tenant_id: string;
    tenant_lifecycle_stage: string;
    tenant_map_center_lat: number | null;
    tenant_map_center_long: number | null;
    tenant_name: string;
    tenant_population: number;
    title_en: string;
    title_multiloc: Multiloc;
    topic_id: string;
    updated_at: string;
    visibility: Visibility;
  };
}
