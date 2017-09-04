import { IRelationship, Multiloc } from 'typings.d';
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
    ideas_count: 0,
    created_at: string;
    updated_at: string;
  };
  relationships: {
    project_images: {
      data: IRelationship[]
    }
  };
}

export interface IUpdatedProjectProperties {
  header_bg?: string | { small: string, medium: string, large: string};
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
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

export function projectStream(slug, streamParams: IStreamParams<IProject> | null = null) {
  return streams.get<IProject>({ apiEndpoint: `${apiEndpoint}/by_slug/${slug}`, ...streamParams });
}

export function addProject(projectData: IUpdatedProjectProperties) {
  return streams.add<IProject>(apiEndpoint, { project: projectData });
}

export function updateProject(projectId, projectData: IUpdatedProjectProperties) {
  return streams.update(`${apiEndpoint}/${projectId}`, projectId, { project: projectData });
}

