import { Multiloc, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import inputTopicsKeys from './keys';

export type InputTopicsKeys = Keys<typeof inputTopicsKeys>;

export interface IInputTopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    full_title_multiloc: Multiloc;
    icon: string | null;
    parent_icon: string | null;
    depth: number;
    children_count: number;
  };
  relationships: {
    project: {
      data: IRelationship;
    };
    parent?: {
      data: IRelationship | null;
    };
    children?: {
      data: IRelationship[];
    };
  };
}

export interface IInputTopic {
  data: IInputTopicData;
  included?: IInputTopicData[];
}

export interface IInputTopics {
  data: IInputTopicData[];
  included?: IInputTopicData[];
}

export interface IInputTopicAdd {
  projectId: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  icon?: string | null;
  parent_id?: string;
}

export interface IInputTopicUpdate {
  projectId: string;
  id: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  icon?: string | null;
}

export type MovePosition = 'child' | 'left' | 'right' | 'root';

export interface IInputTopicMove {
  id: string;
  position: MovePosition;
  target_id?: string;
}
