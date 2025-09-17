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
  attributes: {
    position: number;
  };
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

export interface IFileAttachment {
  data: {
    type: 'file_attachment';
    id: string;
    attributes: {
      position: number;
    };
    relationships: {
      attachable: { data: IRelationship };
      file: { data: IRelationship };
    };
  };
}
