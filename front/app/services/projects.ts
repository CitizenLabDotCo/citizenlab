import { API_PATH } from 'containers/App/constants';

// typings
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { Locale } from '@citizenlab/cl2-component-library';
import {
  IRelationship,
  Multiloc,
  ImageSizes,
  UploadFile,
  CLError,
} from 'typings';
import { IAreaData } from './areas';
import { IAppConfiguration } from 'services/appConfiguration';

import streams, { IStreamParams } from 'utils/streams';
import {
  TSurveyService,
  ParticipationMethod,
  IdeaDefaultSortMethod,
  InputTerm,
} from './participationContexts';

export const apiEndpoint = `${API_PATH}/projects`;
export const HEADER_BG_ASPECT_RATIO = 4 / 1;

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
  | 'posting_limited_max_reached'
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

export type ProjectVotingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'voting_disabled'
  | 'downvoting_disabled'
  | 'not_signed_in'
  | 'upvoting_limited_max_reached'
  | 'downvoting_limited_max_reached'
  | 'not_permitted'
  | 'not_verified';

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
  participation_method: ParticipationMethod;
  posting_enabled: boolean;
  commenting_enabled: boolean;
  // voting_enabled should be used to update the project setting
  // and as a read value if we don't know if the user is doing an up/down vote
  // (although the action_descriptor might be better for that too, to be checked).
  //
  // voting_enabled doesn't take downvoting_enabled into account
  // or upvoting_limited_max/downvoting_limited_max.
  // For more specific values, see the voting_idea action_descriptor
  voting_enabled: boolean;
  upvoting_method: 'limited' | 'unlimited';
  upvoting_limited_max: number;
  downvoting_enabled: boolean;
  downvoting_method: 'limited' | 'unlimited';
  downvoting_limited_max: number;
  presentation_mode: PresentationMode;
  internal_role: 'open_idea_box' | null;
  publication_status: PublicationStatus;
  min_budget?: number;
  max_budget?: number;
  survey_service?: TSurveyService;
  survey_embed_url?: string;
  ordering: number;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  input_term: InputTerm;
  include_all_areas: boolean;
  folder_id?: string;
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
      // the two values below are implemented but can be deleted if not needed
      enabled: boolean;
      disabled_reason: ProjectVotingDisabledReason | null;
      up: {
        enabled: boolean;
        disabled_reason: ProjectVotingDisabledReason | null;
      };
      down: {
        enabled: boolean;
        disabled_reason: ProjectVotingDisabledReason | null;
      };
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
    topics: {
      data: IRelationship[];
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
  };
}

export interface IUpdatedProjectProperties {
  // header_bg is only a string or null when it's
  // in IUpdatedProjectProperties. The ImageSizes needed
  // to be added because we go from string here to ImageSizes
  // in IProjectAttributes (also in this file) when we save an image
  // selected for upload. ImageSizes needs to be here, because
  // Otherwise TS will complain about this mismatch in
  // front/app/containers/Admin/projects/general/index.tsx
  // This oddity needs to be dealt with
  header_bg?: string | ImageSizes | null;
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
  upvoting_method?: 'limited' | 'unlimited' | null;
  downvoting_method?: 'limited' | 'unlimited' | null;
  upvoting_limited_max?: number | null;
  downvoting_enabled?: boolean | null;
  downvoting_limited_max?: number | null;
  presentation_mode?: PresentationMode | null;
  admin_publication_attributes?: {
    publication_status?: PublicationStatus;
  };
  publication_status?: PublicationStatus;
  min_budget?: number | null;
  max_budget?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  default_assignee_id?: string | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  slug?: string;
  topic_ids?: string[];
  include_all_areas?: boolean;
  folder_id?: string;
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
  titleError: Multiloc | null;
  apiErrors: { [fieldName: string]: CLError[] };
  saved: boolean;
  areas: IAreaData[];
  locale: Locale;
  currentTenant: IAppConfiguration | null;
  submitState: ISubmitState;
  slug: string | null;
  showSlugErrorMessage: boolean;
  folder_id?: string;
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
      `${API_PATH}/topics`,
      `${API_PATH}/areas`,
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

  await streams.fetchAllWith({
    dataId: [projectId],
    apiEndpoint: [
      `${API_PATH}/projects`,
      `${API_PATH}/admin_publications`,
      `${API_PATH}/admin_publications/status_counts`,
      `${API_PATH}/users/me`,
      `${API_PATH}/topics`,
      `${API_PATH}/areas`,
    ],
  });

  return response;
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

export function getProjectInputTerm(project: IProjectData) {
  return project.attributes.input_term;
}

export async function updateProjectFolderMembership(
  projectId: string,
  newProjectFolderId: string | null,
  oldProjectFolderId?: string
) {
  const response = await streams.update<IProject>(
    `${apiEndpoint}/${projectId}`,
    projectId,
    { project: { folder_id: newProjectFolderId } }
  );

  await streams.fetchAllWith({
    dataId: [newProjectFolderId, oldProjectFolderId].filter(
      (item) => item
    ) as string[],
    apiEndpoint: [`${API_PATH}/admin_publications`, `${API_PATH}/projects`],
  });

  return response;
}
