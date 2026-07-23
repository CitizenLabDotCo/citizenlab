import { Keys } from 'utils/cl-react-query/types';

import ideaFilesKeys from './keys';

export type IdeaFilesKeys = Keys<typeof ideaFilesKeys>;

export interface IIdeaFileData {
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

export interface IIdeaFile {
  data: IIdeaFileData;
}

export interface IIdeaFiles {
  data: IIdeaFileData[];
}

export interface AddIdeaFileObject {
  ideaId: string;
  file: {
    name: string;
    file: string;
  };
}
