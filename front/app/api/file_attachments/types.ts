import { IRelationship } from 'typings';

type AttachableType = 'Phase' | 'Project' | 'Event' | 'Layout';

export type QueryParameters = {
  attachable_type?: AttachableType;
  attachable_id?: string;
  file_id?: number;
};

export interface IAddFileAttachmentProperties {
  file_id: string;
  attachable_type: AttachableType;
  attachable_id: string;
}

export interface IFileAttachment {
  data: {
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
}
