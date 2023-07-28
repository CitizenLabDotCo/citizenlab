import { Keys } from 'utils/cl-react-query/types';
import tagsKeys from './keys';

export type TagsKeys = Keys<typeof tagsKeys>;

export interface ITagParams {
  analysisId: string;
}

export type TagType = 'custom';

export interface ITagData {
  id: string;
  type: 'tag';
  attributes: {
    name: string;
    tag_type: TagType;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    analysis: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface ITags {
  data: ITagData[];
}

export interface ITag {
  data: ITagData;
}

export interface ITagAdd {
  analysisId: string;
  name: string;
}

export interface ITagUpdate {
  id: string;
  analysisId: string;
  name: string;
}
