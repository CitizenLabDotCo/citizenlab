import { Keys } from 'utils/cl-react-query/types';

import pageFilesKeys from './keys';

export type PageFilesKeys = Keys<typeof pageFilesKeys>;

export interface IPageFileData {
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

export interface IPageFile {
  data: IPageFileData;
}

export interface IPageFiles {
  data: IPageFileData[];
}

export interface AddPageFileObject {
  pageId: string;
  file: {
    name: string;
    file: string;
    ordering?: number | null;
  };
}
