import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import fileAttachmentsKeys from './keys';

export type AttachableType =
  | 'Phase'
  | 'Project'
  | 'Event'
  | 'ContentBuilder::Layout';

export type FileAttachmentKeys = Keys<typeof fileAttachmentsKeys>;

export type QueryParameters = {
  attachable_type?: AttachableType;
  attachable_id?: string;
  file_id?: number;
};

export type IFileAttachments = {
  data: IFileAttachmentData[];
};

export type IFileAttachmentData = {
  id: string;
  type: 'file_attachment';
  attributes: IFileAttachmentAttributes;
  relationships: {
    attachable: { data: IRelationship };
    file: { data: IRelationship };
  };
};

export interface IUpdateFileAttachmentProperties {
  id: string;
  position: number;
}

export interface IAddFileAttachmentProperties {
  file_id: string;
  attachable_type: AttachableType;
  attachable_id: string;
}

interface IFileAttachmentAttributes {
  position: number;
  file_name: string;
  file_size: number;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export interface IFileAttachment {
  data: {
    type: 'file_attachment';
    id: string;
    attributes: IFileAttachmentAttributes;
    relationships: {
      attachable: { data: IRelationship };
      file: { data: IRelationship };
    };
  };
}
