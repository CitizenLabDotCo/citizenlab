import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/projects`;

export interface IProject {
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

export interface IProjectResponse {
  data: IProject[];
  links: any;
}

export function observeProjects(streamParams: IStreamParams<IProjectResponse> | null = null) {
  return streams.create<IProjectResponse>({ apiEndpoint, ...streamParams });
}
