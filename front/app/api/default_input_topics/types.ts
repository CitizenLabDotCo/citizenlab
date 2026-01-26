import { Multiloc, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import defaultInputTopicsKeys from './keys';

export type DefaultInputTopicsKeys = Keys<typeof defaultInputTopicsKeys>;

export interface IDefaultInputTopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    full_title_multiloc: Multiloc;
    icon: string | null;
    depth: number;
    children_count: number;
  };
  relationships?: {
    parent?: {
      data: IRelationship | null;
    };
    children?: {
      data: IRelationship[];
    };
  };
}

export interface IDefaultInputTopic {
  data: IDefaultInputTopicData;
  included?: IDefaultInputTopicData[];
}

export interface IDefaultInputTopics {
  data: IDefaultInputTopicData[];
  included?: IDefaultInputTopicData[];
}

export interface IDefaultInputTopicAdd {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  icon?: string;
  parent_id?: string;
}

export interface IDefaultInputTopicUpdate {
  id: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  icon?: string;
}

export type MovePosition = 'child' | 'left' | 'right' | 'root';

export interface IDefaultInputTopicMove {
  id: string;
  position: MovePosition;
  target_id?: string;
}
