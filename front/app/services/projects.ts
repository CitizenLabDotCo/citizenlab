import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

// api
import { queryClient } from 'utils/cl-react-query/queryClient';
import projectsKeys from 'api/projects/keys';

// typings
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { Locale } from '@citizenlab/cl2-component-library';
import { Multiloc, UploadFile, CLError } from 'typings';
import { IAreaData } from 'api/areas/types';
import { IAppConfiguration } from 'api/app_configuration/types';
import {
  TSurveyService,
  ParticipationMethod,
  IdeaDefaultSortMethod,
  InputTerm,
} from './participationContexts';
import { IProject, IProjectData } from 'api/projects/types';

export const apiEndpoint = `${API_PATH}/projects`;
export const PROJECTABLE_HEADER_BG_ASPECT_RATIO_WIDTH = 4;
export const PROJECTABLE_HEADER_BG_ASPECT_RATIO_HEIGHT = 1;
export const PROJECTABLE_HEADER_BG_ASPECT_RATIO =
  PROJECTABLE_HEADER_BG_ASPECT_RATIO_WIDTH /
  PROJECTABLE_HEADER_BG_ASPECT_RATIO_HEIGHT;

type Visibility = 'public' | 'groups' | 'admins';
export type ProcessType = 'continuous' | 'timeline';
type PresentationMode = 'map' | 'card';
export type PublicationStatus = 'draft' | 'published' | 'archived';

interface ProjectHeaderBgImageSizes {
  large: string | null;
}

export interface IUpdatedProjectProperties {
  // header_bg is only a string or null when it's
  // in IUpdatedProjectProperties. The ProjectHeaderBgImageSizes needed
  // to be added because we go from string here to ProjectHeaderBgImageSizes
  // in IProjectAttributes (also in this file) when we save an image
  // selected for upload. ProjectHeaderBgImageSizes needs to be here, because
  // Otherwise TS will complain about this mismatch in
  // front/app/containers/Admin/projects/general/index.tsx
  // This oddity needs to be dealt with
  header_bg?: string | ProjectHeaderBgImageSizes | null;
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
  folder_id?: string | null;
}

export interface IProjectFormState {
  processing: boolean;
  project: IProject | null | undefined;
  publicationStatus: 'draft' | 'published' | 'archived';
  projectType: 'continuous' | 'timeline';
  projectAttributesDiff: IUpdatedProjectProperties;
  projectHeaderImage: UploadFile[] | null;
  presentationMode: 'map' | 'card';
  projectCardImage: UploadFile | null;
  projectCardImageToRemove: UploadFile | null;
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
  folder_id?: string | null;
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
      `${API_PATH}/admin_publications`,
      `${API_PATH}/users/me`,
      `${API_PATH}/topics`,
      `${API_PATH}/areas`,
    ],
  });
  queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });

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

  queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
  queryClient.invalidateQueries({
    queryKey: projectsKeys.item({ id: projectId }),
  });

  await streams.fetchAllWith({
    dataId: [projectId],
    apiEndpoint: [
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

  queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/admin_publications`],
  });

  return response;
}

export async function copyProject(projectId: string) {
  const response = await streams.add(`${apiEndpoint}/${projectId}/copy`, {});

  queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/admin_publications`, `${API_PATH}/users/me`],
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

  queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
  await streams.fetchAllWith({
    dataId: [newProjectFolderId, oldProjectFolderId].filter(
      (item) => item
    ) as string[],
    apiEndpoint: [`${API_PATH}/admin_publications`],
  });

  return response;
}
