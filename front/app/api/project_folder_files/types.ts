import { IStreamParams } from 'utils/streams';
import projectFolderFilesKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type ProjectFolderFilesKeys = Keys<typeof projectFolderFilesKeys>;

export interface IProjectFolderFileData {
  id: string;
  type: string;
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

export interface IQueryParameters {
  projectFolderId: string;
  streamParams?: IStreamParams | null;
}

export interface IProjectFolderFile {
  data: IProjectFolderFileData;
}

export interface IProjectFolderFiles {
  data: IProjectFolderFileData[];
}
