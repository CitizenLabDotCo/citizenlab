import { Keys } from 'utils/cl-react-query/types';
import tagsKeys from './keys';

export type TagsKeys = Keys<typeof tagsKeys>;

export interface ITagParams {
  projectId: string;
}

type TagTypes = 'custom';

export interface ITagData {
  id: string;
  type: 'tag';
  attributes: {
    name: string;
    tag_type: TagTypes;
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
  projectId: string;
  name: string;
}

export interface ITagUpdate {
  id: string;
  projectId: string;
  name: string;
}
