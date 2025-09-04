import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import fileAttachmentsKeys from './keys';

export type AttachableType = 'Phase' | 'Project' | 'Event';

export type FileAttachmentKeys = Keys<typeof fileAttachmentsKeys>;

export type QueryParameters = {
  attachable_type?: AttachableType;
  attachable_id?: string;
  file_id?: number;
};

export type IFileAttachments = {
  data: IFileAttachment[];
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
  type: 'file_attachment';
  data: {
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
