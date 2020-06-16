import { IRelationship, Multiloc, ImageSizes } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { SurveyServices, ParticipationMethod } from './participationContexts';

const apiEndpoint = `${API_PATH}/projects`;

type Visibility = 'public' | 'groups' | 'admins';
export type ProcessType = 'continuous' | 'timeline';
type PresentationMode = 'map' | 'card';
export type PublicationStatus = 'draft' | 'published' | 'archived';
export type PostingDisabledReasons = 'project_inactive' | 'not_ideation' | 'posting_disabled' | 'not_permitted' | 'not_verified';
export type CommentingDisabledReasons = 'project_inactive' | 'not_supported' | 'commenting_disabled' | 'not_permitted';
export type VotingDisabledReasons = 'project_inactive' | 'not_ideation' | 'voting_disabled' | 'not_permitted' | 'voting_limited_max_reached';
export type SurveyDisabledReasons = 'project_inactive' | 'not_survey' | 'not_permitted' | 'not_verified' | 'not_signed_in';
export type PollDisabledReasons = 'project_inactive' | 'not_poll' | 'not_permitted' | 'already_responded' | 'not_verified';
export interface IProjectData {
  id: string;
  type: 'project';
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    description_preview_multiloc: Multiloc;
    slug: string;
    header_bg: ImageSizes;
    ideas_count: number;
    comments_count: number;
    avatars_count: number;
    created_at: string;
    updated_at: string;
    visible_to: Visibility;
    process_type: ProcessType;
    timeline_active?: 'past' | 'present' | 'future' | null;
    participation_method: ParticipationMethod | null;
    posting_enabled: boolean;
    commenting_enabled: boolean;
    voting_enabled: boolean;
    voting_method: 'limited' | 'unlimited';
    voting_limited_max: number;
    downvoting_enabled: boolean;
    presentation_mode: PresentationMode;
    internal_role: 'open_idea_box' | null;
    publication_status: PublicationStatus;
    max_budget?: number;
    survey_service?: SurveyServices;
    survey_embed_url?: string;
    ordering: number;
    location_allowed?: boolean;
    poll_anonymous?: boolean;
    action_descriptor: {
      posting: {
        enabled: boolean,
        future_enabled: string | null,
        disabled_reason: PostingDisabledReasons | null,
      }
      commenting: {
        enabled: boolean,
        disabled_reason: CommentingDisabledReasons | null,
      }
      voting: {
        enabled: boolean,
        disabled_reason: VotingDisabledReasons | null,
      }
      taking_survey: {
        enabled: boolean;
        disabled_reason: SurveyDisabledReasons | null;
      },
      taking_poll: {
        enabled: boolean;
        disabled_reason: PollDisabledReasons | null;
      }
    }
  };
  relationships: {
    project_images: {
      data: IRelationship[]
    }
    areas: {
      data: IRelationship[]
    }
    avatars?: {
      data?: IRelationship[]
    }
    current_phase?: {
      data: IRelationship | null;
    }
    user_basket?: {
      data: IRelationship | null;
    }
    default_assignee?: {
      data: IRelationship | null;
    }
    admin_publication: {
      data: IRelationship | null;
    }
  };
}

export interface IUpdatedProjectProperties {
  header_bg?: string | { small: string, medium: string, large: string } | null;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  description_preview_multiloc?: Multiloc;
  area_ids?: string[];
  visible_to?: Visibility;
  process_type?: ProcessType;
  participation_method?: ParticipationMethod | null;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  voting_enabled?: boolean | null;
  voting_method?: 'limited' | 'unlimited' | null;
  voting_limited_max?: number | null;
  downvoting_enabled?: boolean | null;
  presentation_mode?: PresentationMode | null;
  publication_status?: PublicationStatus;
  max_budget?: number | null;
  survey_service?: SurveyServices | null;
  survey_embed_url?: string | null;
  default_assignee_id?: string | null;
  poll_anonymous?: boolean;
}

export interface IProject {
  data: IProjectData;
}

export interface IProjects {
  data: IProjectData[];
}

type IQueryParametersWithPS = {
  publication_statuses: PublicationStatus[];
  [key: string]: any;
} | {
  filter_ids: string[];
  [key: string]: any;
};

interface StreamParamsForProjects extends IStreamParams {
  queryParameters: IQueryParametersWithPS;
}

export function projectsStream(streamParams: StreamParamsForProjects) {
  return streams.get<IProjects>({ apiEndpoint, ...streamParams });
}

export function projectBySlugStream(projectSlug: string, streamParams: IStreamParams | null = null) {
  return streams.get<IProject>({ apiEndpoint: `${apiEndpoint}/by_slug/${projectSlug}`, ...streamParams });
}

export function projectByIdStream(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IProject>({ apiEndpoint: `${apiEndpoint}/${projectId}`, ...streamParams });
}

export async function addProject(projectData: IUpdatedProjectProperties) {
  const response = await streams.add<IProject>(apiEndpoint, { project: projectData });
  const projectId = response.data.id;
  await streams.fetchAllWith({
    dataId: [projectId],
    apiEndpoint: [`${API_PATH}/projects`, `${API_PATH}/admin_publications`]
  });
  return response;
}

export async function updateProject(projectId, projectData: IUpdatedProjectProperties) {
  const response = await streams.update<IProject>(`${apiEndpoint}/${projectId}`, projectId, { project: projectData });
  streams.fetchAllWith({
    dataId: [projectId],
    apiEndpoint: [`${API_PATH}/projects`, `${API_PATH}/admin_publications`]
  });

  // TODO: clear partial cache

  return response;
}

export function reorderProject(projectId: IProjectData['id'], newOrder: number) {
  return streams.update<IProject>(`${apiEndpoint}/${projectId}/reorder`, projectId, { project: { ordering: newOrder } });
}

export async function deleteProject(projectId: string) {
  const response = await streams.delete(`${apiEndpoint}/${projectId}`, projectId);
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/projects`, `${API_PATH}/admin_publications`] });
  return response;
}

export function getProjectUrl(project: IProjectData) { // TODO MOVE projects root route
  let lastUrlSegment: string;
  const projectType = project.attributes.process_type;
  const projectMethod = project.attributes.participation_method;
  const rootProjectUrl = `/projects/${project.attributes.slug}`;

  // Determine where to send the user based on process type & participation method
  if (projectType === 'timeline') {
    lastUrlSegment = 'process';
  } else if (projectMethod === 'survey') {
    lastUrlSegment = 'survey';
  } else if (projectType === 'continuous' && projectMethod === 'budgeting') {
    lastUrlSegment = 'ideas';
  } else {
    lastUrlSegment = 'info';
  }

  return `${rootProjectUrl}/${lastUrlSegment}`;
}

export function getProjectIdeasUrl(project: IProjectData) {
  let projectUrl: string;
  const projectType = project.attributes.process_type;
  const projectMethod = project.attributes.participation_method;
  const rootProjectUrl = `/projects/${project.attributes.slug}`;

  if (projectType === 'timeline') {
    projectUrl = `${rootProjectUrl}/process`;
  } else if (projectMethod === 'ideation' || projectMethod === 'budgeting') {
    projectUrl = `${rootProjectUrl}/ideas`;
  } else {
    projectUrl = getProjectUrl(project);
  }

  return projectUrl;
}

export async function updateProjectFolderMembership(projectId: string, newProjectFolderId: string | null, oldProjectFolderId?: string) {
  const response = await streams.update<IProject>(`${apiEndpoint}/${projectId}`, projectId, { project: { folder_id: newProjectFolderId } });

  await streams.fetchAllWith({
    dataId: [newProjectFolderId, oldProjectFolderId].filter(item => item) as string[],
    apiEndpoint: [`${API_PATH}/admin_publications`, `${API_PATH}/projects`],
  });

  return response;
}
