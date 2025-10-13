import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import filesKeys from './keys';

export type FilesKeys = Keys<typeof filesKeys>;

export const FILE_CATEGORIES = [
  'meeting',
  'interview',
  'strategic_plan',
  'info_sheet',
  'policy',
  'report',
  'other',
];

export type FileCategory = (typeof FILE_CATEGORIES)[number];

export interface IAddFileProperties {
  content: string;
  project?: string;
  name: string;
  category: FileCategory;
  ai_processing_allowed?: boolean;
}

export interface IUpdateFileProperties {
  id: string;
  file: {
    name: string;
    category?: FileCategory;
    description_multiloc?: Multiloc;
    ai_processing_allowed?: boolean;
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
  project?: string[];
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
  project?: string[];
  sort?: FileSortOptions;
  search?: string;
  deleted?: boolean;
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
    preview?: { data: IRelationship | null };
    uploader?: { data?: IRelationship };
    project?: { data: IRelationship | null };
    transcript?: { data: IRelationship | null };
    attachments?: { data: IRelationship[] };
  };
}

export interface IFileAttributes {
  title: string;
  name: string;
  mime_type: string;
  size: number; // in bytes,
  category: FileCategory;
  description_multiloc: Multiloc;
  ai_processing_allowed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  content: {
    url: string;
  };
}
