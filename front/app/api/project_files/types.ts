import { Keys } from 'utils/cl-react-query/types';

import projectFilesKeys from './keys';

export type ProjectFilesKeys = Keys<typeof projectFilesKeys>;

export interface IProjectFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string;
    };
    ordering: number | null;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IProjectFile {
  data: IProjectFileData;
}

export interface IProjectFiles {
  data: IProjectFileData[];
}

export interface AddProjectFileObject {
  projectId: string;
  file: {
    name: string;
    file: string;
    ordering?: number;
  };
}

export interface UpdateProjectFileObject {
  projectId: string;
  fileId: string;
  file: {
    ordering?: number;
  };
}
