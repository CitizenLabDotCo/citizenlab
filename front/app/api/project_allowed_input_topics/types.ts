import { IRelationship } from 'typings';
import projectAllowedInputTopicsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type ProjectAllowedInputTopicsKeys = Keys<
  typeof projectAllowedInputTopicsKeys
>;

export type IProjectAllowedTopicsParams = {
  projectId?: string;
};

export interface IProjectAllowedInputTopicData {
  id: string;
  type: 'projects_allowed_input_topic';
  attributes: {
    ordering: number;
  };
  relationships: {
    project: {
      data: IRelationship;
    };
    topic: {
      data: IRelationship;
    };
  };
}

export interface IProjectAllowedInputTopics {
  data: IProjectAllowedInputTopicData[];
}

export type IProjectAllowedInputTopic = {
  data: IProjectAllowedInputTopicData;
};

export interface IProjectAllowedInputTopicAdd {
  project_id: string;
  topic_id: string;
}
