import projectFolderFilesKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

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

export interface IQueryParameters {
  projectFolderId: string;
}

export interface IProjectFolderFile {
  data: IProjectFolderFileData;
}

export interface IProjectFolderFiles {
  data: IProjectFolderFileData[];
}
