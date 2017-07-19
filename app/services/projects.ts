import { IRelationship } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

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

export interface IProject {
  data: IProjectData;
}

export interface IProjects {
  data: IProjectData[];
}

export function observeProjects(streamParams: IStreamParams<IProjects> | null = null) {
  return streams.create<IProjects>({ apiEndpoint, ...streamParams });
}
