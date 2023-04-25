import { Multiloc, IRelationship } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import topicsKeys from './keys';

export type TopicsKeys = Keys<typeof topicsKeys>;

type DefaultTopicCodes =
  | 'nature'
  | 'waste'
  | 'sustainability'
  | 'mobility'
  | 'technology'
  | 'economy'
  | 'housing'
  | 'public_space'
  | 'safety'
  | 'education'
  | 'culture'
  | 'health'
  | 'inclusion'
  | 'community'
  | 'services'
  | 'other';

export type Code = 'custom' | DefaultTopicCodes;

export interface ITopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    icon: string;
    ordering: number;
    code: Code;
    static_page_ids: string[];
  };
  relationships: {
    static_pages: {
      data: IRelationship[];
    };
  };
}

export interface ITopic {
  data: ITopicData;
}

export interface ITopics {
  data: ITopicData[];
}

export interface ITopicsQueryParams {
  code?: Code;
  excludeCode?: Code;
  sort?: 'new' | 'custom';
  forHomepageFilter?: boolean;
  includeStaticPages?: boolean;
}

export interface ITopicAdd {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface ITopicUpdate {
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
}
