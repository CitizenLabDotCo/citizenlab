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

export interface IProjectAttributes {
  header_bg?: string | { small: string, medium: string, large: string};
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
}

export interface IProjectImageData {
  id: string;
  type: string;
  attributes: {
    versions: {
      small: string,
      medium: string,
      large: string,
    },
    ordering: string | null,
    created_at: string,
    updated_at: string,
  };
}

export interface IProjectImage {
  data: IProjectImageData[];
}

export interface IProject {
  data: IProjectData;
}

export interface IProjects {
  data: IProjectData[];
}

export function observeProjects(streamParams: IStreamParams<IProjects> | null = null) {
  return streams.create<IProjects>({ apiEndpoint, ...streamParams });
}

export function observeProject(slug, streamParams: IStreamParams<IProject> | null = null) {
  return streams.create<IProject>({ apiEndpoint: `${apiEndpoint}/by_slug/${slug}`, ...streamParams });
}

export function postProject(projectData: IProjectAttributes) {
  const bodyData = { project: projectData };
  const httpOptions = { method: 'POST' };
  return request(`${apiEndpoint}`, bodyData, httpOptions, null);
}

export function updateProject(projectId, projectData: IProjectAttributes) {
  /*
  const bodyData = { project: projectData };
  const httpOptions = { method: 'PATCH' };

  return request(`${apiEndpoint}/${projectId}`, bodyData, httpOptions, null).then((project) => {
    streams.update(projectId, project);
    return project;
  }).catch((e) => {
    throw new Error('Error for updateProject() of service Projects');
  });
  */

  return streams.update(`${apiEndpoint}/${projectId}`, projectId, { project: projectData });
}

export function getProjectImages(projectId: string, streamParams: IStreamParams<IProjectImage> | null = null) {
  return streams.create<IProjectImage>({ apiEndpoint: `${apiEndpoint}/${projectId}/images`, ...streamParams });
}

export function uploadProjectImage(projectId, base64) {
  const bodyData = { image: { image: base64 } };
  const httpOptions = { method: 'POST' };
  return request(`${apiEndpoint}/${projectId}/images`, bodyData, httpOptions, null);
}

export function deleteProjectImage(projectId, imageId) {
  const httpOptions = { method: 'DELETE' };
  return request(`${apiEndpoint}/${projectId}/images/${imageId}`, {}, httpOptions, null);
}
