import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import filePreviewsKeys from './keys';

export type FilePreviewKeys = Keys<typeof filePreviewsKeys>;

export type FilePreviewStatus = 'pending' | 'completed' | 'failed';

export interface IFilePreviewAttributes {
  content: {
    url: string;
  };
  status: FilePreviewStatus;
  created_at: string;
  updated_at: string;
}
export interface IFilePreviewData {
  id: string;
  type: string;
  attributes: IFilePreviewAttributes;
  relationships: {
    file: {
      data: IRelationship;
    };
  };
}

export interface IFilePreview {
  data: IFilePreviewData;
}
