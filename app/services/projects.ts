import { IProject } from './projects';
import { IRelationship, Multiloc, API } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/projects`;

type Visibility = 'public' | 'groups' | 'admins';

export interface IProjectData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    description_preview_multiloc: Multiloc;
    slug: string;
    header_bg: API.ImageSizes;
    ideas_count: number;
    created_at: string;
    updated_at: string;
    visible_to: Visibility;
  };
  relationships: {
    project_images: {
      data: IRelationship[]
    }
    areas: {
      data: IRelationship[]
    }
  };
}

export interface IUpdatedProjectProperties {
  header_bg?: string | { small: string, medium: string, large: string};
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  description_preview_multiloc?: Multiloc;
  area_ids?: string[];
  visible_to?: Visibility;
}

export interface IProject {
  data: IProjectData;
}

export interface IProjects {
  data: IProjectData[];
}

export function projectsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IProjects>({ apiEndpoint, ...streamParams });
}

export function projectBySlugStream(projectSlug: string, streamParams: IStreamParams | null = null) {
  return streams.get<IProject>({ apiEndpoint: `${apiEndpoint}/by_slug/${projectSlug}`, ...streamParams });
}

export function projectByIdStream(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IProject>({ apiEndpoint: `${apiEndpoint}/${projectId}`, ...streamParams });
}

export function addProject(projectData: IUpdatedProjectProperties) {
  return streams.add<IProject>(apiEndpoint, { project: projectData });
}

export function updateProject(projectId, projectData: IUpdatedProjectProperties) {
  return streams.update<IProject>(`${apiEndpoint}/${projectId}`, projectId, { project: projectData });
}

export function deleteProject(projectId: string) {
  return streams.delete(`${apiEndpoint}/${projectId}`, projectId);
}
