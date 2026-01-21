import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import defaultInputTopicsKeys from './keys';

export type DefaultInputTopicsKeys = Keys<typeof defaultInputTopicsKeys>;

export interface IDefaultInputTopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    icon: string | null;
    ordering: number;
  };
}

export interface IDefaultInputTopic {
  data: IDefaultInputTopicData;
}

export interface IDefaultInputTopics {
  data: IDefaultInputTopicData[];
}

export interface IDefaultInputTopicAdd {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  icon?: string;
}

export interface IDefaultInputTopicUpdate {
  id: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  icon?: string;
}
