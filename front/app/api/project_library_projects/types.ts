import { Multiloc, ILinks } from 'typings';

import { ParticipationMethod } from 'api/phases/types';
import { PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

type Status = 'active' | 'finished' | 'stale' | 'archived';

export type PopulationGroup = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type SortType =
  | 'start_at asc'
  | 'start_at desc'
  | 'participants asc'
  | 'participants desc';

export type RansackParams = {
  // filters
  'q[tenant_country_code_in]'?: string[];
  'q[phases_participation_method_in]'?: Exclude<
    ParticipationMethod,
    'survey'
  >[];
  'q[tenant_population_group_in]'?: PopulationGroup[];
  'q[topic_id_in]'?: string[];
  'q[practical_end_at_gteq]'?: string;
  'q[practical_end_at_lt]'?: string;
  'q[title_en_or_description_en_or_tenant_name_cont]'?: string;
  'q[pin_country_code_eq]'?: string;

  // sorting
  'q[s]'?: SortType;
};

export type Parameters = RansackParams & {
  'page[number]'?: number;
  'page[size]'?: number;
};

export type ProjectLibraryProjectsKeys = Keys<typeof miniProjectsKeys>;

export interface ProjectLibraryProjects {
  data: ProjectLibraryProjectData[];
  links: ILinks;
}

export interface ProjectLibraryProject {
  data: ProjectLibraryProjectData;
}

export interface ProjectLibraryProjectData {
  id: string;
  type: 'project_library_project';
  attributes: {
    annotation_multiloc: Multiloc | null;
    cl_created_at: string;
    cl_updated_at: string;
    comments_count: number;
    created_at: string;
    description_en: string;
    description_multiloc: Multiloc;
    end_at: string | null;
    folder_id: string | null;
    folder_title_en: string | null;
    folder_title_multiloc: Multiloc | null;
    image_url: string | null;
    participants: number;
    practical_end_at: string | null;
    publication_status: PublicationStatus;
    score_feedback: number | null;
    score_influence: number | null;
    score_participation: number | null;
    score_process: number | null;
    score_total: number | null;
    slack_references_count: number;
    slug: string;
    start_at: string;
    status: Status;
    tenant_country_code: string | null;
    tenant_host: string;
    tenant_id: string;
    tenant_lifecycle_stage: string;
    tenant_map_center_lat: number | null;
    tenant_map_center_long: number | null;
    tenant_name: string;
    tenant_population_group: PopulationGroup | null;
    title_en: string;
    title_multiloc: Multiloc;
    topic_id: string;
    updated_at: string;
    visibility: 'public' | 'restricted';
  };
  relationships: {
    phases: {
      data: { id: string; type: 'project_library_phase' }[];
    };
    topic: {
      data: { id: string; type: 'project_library_topic' };
    };
  };
}
