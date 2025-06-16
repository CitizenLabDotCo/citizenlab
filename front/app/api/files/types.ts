import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import filesKeys from './keys';

export type FilesKeys = Keys<typeof filesKeys>;

type FileSortOptions =
  | 'created_at'
  | '-created_at'
  | 'name'
  | '-name'
  | 'size'
  | '-size';

export interface QueryParameters {
  'page[number]'?: number;
  'page[size]'?: number;
  uploader_id?: string;
  projects?: string[];
  sort?: FileSortOptions;
  search?: string;
  deleted?: boolean;
}

export interface Props {
  pageNumber?: number;
  pageSize?: number;
}

export interface IFiles {
  data: IFileData[];
  meta: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
  links: {
    self: string;
    next: string;
    last: string;
  };
}

export interface IFile {
  data: IFileData;
}

export interface IFileData {
  id: string;
  type: string;
  attributes: IFileAttributes;
  relationships: {
    uploader: IRelationship;
  };
}

export interface IFileAttributes {
  title: string;
  name: string;
  mime_type: string;
  size: number; // in bytes,
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
