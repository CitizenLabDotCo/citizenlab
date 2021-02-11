import { API_PATH } from 'containers/App/constants';

// typings
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { Locale } from 'cl2-component-library/dist/utils/typings';
import {
  IRelationship,
  Multiloc,
  ImageSizes,
  UploadFile,
  IOption,
  CLError,
} from 'typings';
import { IAreaData } from './areas';
import { IAppConfiguration } from 'services/tenant';

import streams, { IStreamParams } from 'utils/streams';
import {
  SurveyServices,
  ParticipationMethod,
  IdeaDefaultSortMethod,
  InputTerm,
} from './participationContexts';

const apiEndpoint = `${API_PATH}/projects`;

type Visibility = 'public' | 'groups' | 'admins';
export type ProcessType = 'continuous' | 'timeline';
type PresentationMode = 'map' | 'card';
export type PublicationStatus = 'draft' | 'published' | 'archived';

// keys in project.attributes.action_descriptor
export type IProjectAction =
  | 'commenting_idea'
  | 'voting_idea'
  | 'comment_voting_idea'
  | 'posting_idea'
  | 'taking_survey'
  | 'taking_poll';

export type PostingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'posting_disabled'
  | 'not_permitted'
  | 'not_verified'
  | 'not_signed_in';

export type CommentingDisabledReason =
  | 'not_verified'
  | 'project_inactive'
  | 'not_supported'
  | 'commenting_disabled'
  | 'not_permitted'
  | 'not_signed_in';

export type VotingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'voting_disabled'
  | 'not_permitted'
  | 'voting_limited_max_reached'
  | 'not_signed_in';

export type SurveyDisabledReason =
  | 'project_inactive'
  | 'not_survey'
  | 'not_permitted'
  | 'not_verified'
  | 'not_signed_in';

export type PollDisabledReason =
  | 'project_inactive'
  | 'not_poll'
  | 'not_permitted'
  | 'already_responded'
  | 'not_verified'
  | 'not_signed_in';

export interface IProjectAttributes {
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
  participants_count: number;
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
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  input_term: InputTerm;
  action_descriptor: {
    posting_idea: {
      enabled: boolean;
      future_enabled: string | null;
      disabled_reason: PostingDisabledReason | null;
    };
    commenting_idea: {
      enabled: boolean;
      disabled_reason: CommentingDisabledReason | null;
    };
    voting_idea: {
      enabled: boolean;
      disabled_reason: VotingDisabledReason | null;
    };
    taking_survey: {
      enabled: boolean;
      disabled_reason: SurveyDisabledReason | null;
    };
    taking_poll: {
      enabled: boolean;
      disabled_reason: PollDisabledReason | null;
    };
  };
}

export interface IProjectData {
  id: string;
  type: 'project';
  attributes: IProjectAttributes;
  relationships: {
    project_images: {
      data: IRelationship[];
    };
    areas: {
      data: IRelationship[];
    };
    avatars?: {
      data?: IRelationship[];
    };
    current_phase?: {
      data: IRelationship | null;
    };
    user_basket?: {
      data: IRelationship | null;
    };
    default_assignee?: {
      data: IRelationship | null;
    };
    admin_publication: {
      data: IRelationship | null;
    };
    topics: {
      data: IRelationship[] | null;
    };
  };
}

export interface IUpdatedProjectProperties {
  header_bg?: string | { small: string; medium: string; large: string } | null;
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
  admin_publication_attributes?: {
    publication_status?: PublicationStatus;
  };
  publication_status?: PublicationStatus;
  max_budget?: number | null;
  survey_service?: SurveyServices | null;
  survey_embed_url?: string | null;
  default_assignee_id?: string | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  slug?: string;
}

export interface IProjectFormState {
  processing: boolean;
  project: IProject | null | undefined;
  publicationStatus: 'draft' | 'published' | 'archived';
  projectType: 'continuous' | 'timeline';
  projectAttributesDiff: IUpdatedProjectProperties;
  projectHeaderImage: UploadFile[] | null;
  presentationMode: 'map' | 'card';
  projectImages: UploadFile[];
  projectImagesToRemove: UploadFile[];
  projectFiles: UploadFile[];
  projectFilesToRemove: UploadFile[];
  noTitleError: Multiloc | null;
  apiErrors: { [fieldName: string]: CLError[] };
  saved: boolean;
  areas: IAreaData[];
  areaType: 'all' | 'selection';
  locale: Locale;
  currentTenant: IAppConfiguration | null;
  areasOptions: IOption[];
  submitState: ISubmitState;
  slug: string | null;
  showSlugErrorMessage: boolean;
}

export interface IProject {
  data: IProjectData;
}

export interface IProjects {
  data: IProjectData[];
}

type IQueryParametersWithPS =
  | {
      publication_statuses: PublicationStatus[];
      [key: string]: any;
    }
  | {
      filter_ids: string[];
      [key: string]: any;
    };

interface StreamParamsForProjects extends IStreamParams {
  queryParameters: IQueryParametersWithPS;
}

export function projectsStream(streamParams: StreamParamsForProjects) {
  return streams.get<IProjects>({ apiEndpoint, ...streamParams });
}

export function projectBySlugStream(
  projectSlug: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProject>({
    apiEndpoint: `${apiEndpoint}/by_slug/${projectSlug}`,
    ...streamParams,
  });
}

export function projectByIdStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProject>({
    apiEndpoint: `${apiEndpoint}/${projectId}`,
    ...streamParams,
  });
}

export async function addProject(projectData: IUpdatedProjectProperties) {
  const response = await streams.add<IProject>(apiEndpoint, {
    project: projectData,
  });
  const projectId = response.data.id;
  await streams.fetchAllWith({
    dataId: [projectId],
    apiEndpoint: [
      `${API_PATH}/projects`,
      `${API_PATH}/admin_publications`,
      `${API_PATH}/users/me`,
    ],
  });
  return response;
}

export async function updateProject(
  projectId: string,
  projectData: IUpdatedProjectProperties
) {
  const response = await streams.update<IProject>(
    `${apiEndpoint}/${projectId}`,
    projectId,
    { project: projectData }
  );
  streams.fetchAllWith({
    dataId: [projectId],
    apiEndpoint: [
      `${API_PATH}/projects`,
      `${API_PATH}/admin_publications`,
      `${API_PATH}/users/me`,
    ],
  });

  // TODO: clear partial cache

  return response;
}

export function reorderProject(
  projectId: IProjectData['id'],
  newOrder: number
) {
  return streams.update<IProject>(
    `${apiEndpoint}/${projectId}/reorder`,
    projectId,
    { project: { ordering: newOrder } }
  );
}

export async function deleteProject(projectId: string) {
  const response = await streams.delete(
    `${apiEndpoint}/${projectId}`,
    projectId
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/projects`, `${API_PATH}/admin_publications`],
  });
  return response;
}

export function getProjectUrl(project: IProjectData) {
  return `/projects/${project.attributes.slug}`;
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

export function getProjectInputTerm(project: IProjectData) {
  return project.attributes.input_term;
}
