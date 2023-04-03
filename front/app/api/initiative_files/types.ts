import { Keys } from 'utils/cl-react-query/types';
import initiativeFilesKeys from './keys';

export type InitiativeFilesKeys = Keys<typeof initiativeFilesKeys>;

export interface IInitiativeFileData {
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

export interface IInitiativeFile {
  data: IInitiativeFileData;
}

export interface IInitiativeFiles {
  data: IInitiativeFileData[];
}

export interface AddInitiativeFileObject {
  initiativeId: string;
  file: {
    name: string;
    file: string;
  };
}
