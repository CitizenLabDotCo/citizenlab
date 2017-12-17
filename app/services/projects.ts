import { IProject } from './projects';
import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';

const apiEndpoint = `${API_PATH}/projects`;

export interface IProjectData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: {
      [key: string]: string;
    };
    description_multiloc: {
      [key: string]: string;
    };
    slug: string;
    header_bg: {
      large: string | null;
      medium: string | null;
      small: string | null;
    };
    ideas_count: 0;
    created_at: string;
    updated_at: string;
    visible_to: 'public' | 'groups' | 'admins';
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
  area_ids?: string[];
  visible_to?: 'public' | 'groups' | 'admins';
}

export interface IProject {
  data: IProjectData;
}

export interface IProjects {
  data: IProjectData[];
}

export function projectsStream(streamParams: IStreamParams<IProjects> | null = null) {
  return streams.get<IProjects>({ apiEndpoint, ...streamParams });
}

export function projectBySlugStream(projectSlug: string, streamParams: IStreamParams<IProject> | null = null) {
  return streams.get<IProject>({ apiEndpoint: `${apiEndpoint}/by_slug/${projectSlug}`, ...streamParams });
}

export function projectByIdStream(projectId: string, streamParams: IStreamParams<IProject> | null = null) {
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
