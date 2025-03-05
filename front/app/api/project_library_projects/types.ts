import { Multiloc, ILinks } from 'typings';

import { ParticipationMethod } from 'api/phases/types';
import { PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import miniProjectsKeys from './keys';

export type Status = 'draft' | 'active' | 'finished' | 'stale' | 'archived';

type PopulationGroup = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type SortType = 'start_at asc' | 'start_at desc';

export type RansackParams = {
  // filters
  'q[tenant_country_alpha2]'?: string;
  'q[tenant_population_group_eq]'?: PopulationGroup;
  'q[score_total_gteq]'?: '1' | '2' | '3' | '4';
  'q[phases_participation_method_eq]'?: ParticipationMethod;
  'q[topic_id_eq]'?: string;
  'q[status_eq]'?: Status;
  'q[visibility_eq]'?: 'public' | 'restricted'; // TODO check if this is correct / matches the response?
  'q[practical_end_at_gteq]'?: string;
  'q[practical_end_at_lt]'?: string;
  'q[title_en_or_description_en_or_tenant_name_cont]'?: string;

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
    score_participation: number | null;
    score_process: number | null;
    score_total: number | null;
    slack_references_count: number;
    slug: string;
    start_at: string;
    status: Status;
    tenant_country_alpha2: string | null;
    tenant_host: string;
    tenant_id: string;
    tenant_lifecycle_stage: string;
    tenant_map_center_lat: number | null;
    tenant_map_center_long: number | null;
    tenant_name: string;
    tenant_population_group: PopulationGroup;
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
      data: { id: string; type: 'project_library_topid' };
    };
  };
}
