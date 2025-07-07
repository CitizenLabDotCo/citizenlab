import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import filesKeys from './keys';

export type FilesKeys = Keys<typeof filesKeys>;

export interface IAddFileProperties {
  content: string;
  project?: string;
  name: string;
}

export interface IUpdateFileProperties {
  id: string;
  file: {
    name: string;
  };
}

type FileSortOptions =
  | 'created_at'
  | '-created_at'
  | 'name'
  | '-name'
  | 'size'
  | '-size';

export interface QueryParameters {
  uploader_id?: string;
  projects?: string[];
  sort?: FileSortOptions;
  search?: string;
  deleted?: boolean;
  'page[number]'?: number;
  'page[size]'?: number;
}

export interface GetFilesParameters {
  pageNumber?: number;
  pageSize?: number;
  uploaderId?: string;
  projects?: string[];
  sort?: FileSortOptions;
  search?: string;
  deleted?: boolean;
}

export interface IPaginationProps {
  pageNumber?: number;
  pageSize?: number;
}

export interface IFiles {
  data: IFileData[];
  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
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
    uploader: { data: IRelationship };
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
