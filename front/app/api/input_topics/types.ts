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
    icon: string | null;
    ordering: number;
  };
  relationships: {
    project: {
      data: IRelationship;
    };
  };
}

export interface IInputTopic {
  data: IInputTopicData;
}

export interface IInputTopics {
  data: IInputTopicData[];
}

export interface IInputTopicAdd {
  projectId: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  icon?: string;
}

export interface IInputTopicUpdate {
  projectId: string;
  id: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  icon?: string;
}
