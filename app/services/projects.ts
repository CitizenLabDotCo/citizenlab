import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/projects`;

export interface IProjectData {
  id: string;
  type: string;
  attributes: {
    created_ad: string,
    description_multiloc: {
      [key: string]: string
    },
    slug: string,
    title_multiloc: {
      [key: string]: string
    },
    updated_at: string,
  };
  relationships: any;
}

export interface IProjects {
  data: IProjectData[];
  links ?: any;
}

export interface IProject {
  data: IProjectData;
}

export function observeProjects(streamParams: IStreamParams<IProjects> | null = null) {
  return streams.create<IProjects>({ apiEndpoint, ...streamParams });
}

export function observeProject(id, streamParams: IStreamParams<IProject> | null = null) {
  return streams.create<IProject>({ apiEndpoint: `${apiEndpoint}/${id}`, ...streamParams });
}
