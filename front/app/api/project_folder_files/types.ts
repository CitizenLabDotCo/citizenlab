import { Keys } from 'utils/cl-react-query/types';

import projectFolderFilesKeys from './keys';

export type ProjectFolderFilesKeys = Keys<typeof projectFolderFilesKeys>;

export interface IProjectFolderFileData {
  id: string;
  type: 'file';
  attributes: {
    file: {
      url: string;
    };
    ordering: string | null;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
  };
}

export interface AddProjectFolderObject {
  projectFolderId: string;
  file: string;
  name: string;
  ordering?: number | null;
}

export interface UpdateProjectFolderFileObject {
  projectFolderId: string;
  fileId: string;
  file: {
    ordering?: number;
  };
}

export interface IQueryParameters {
  projectFolderId: string;
}

export interface IProjectFolderFile {
  data: IProjectFolderFileData;
}

export interface IProjectFolderFiles {
  data: IProjectFolderFileData[];
}
